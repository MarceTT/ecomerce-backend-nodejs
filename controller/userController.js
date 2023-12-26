const { matchedData } = require("express-validator");
const { encrypt, compare } = require("../helpers/handleBcrypt");
const Users = require("../models/user");
const Products = require("../models/product");
const Cart = require("../models/cart");
const Coupons = require("../models/coupon");
const Order = require("../models/order");
const { handleHttpError } = require("../helpers/handleErrors");
const asyncHandler = require("express-async-handler");
const { tokenSign } = require("../helpers/handlejwt");
const validateMongoDbId = require("../helpers/handleMongoId");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("./emailController");

const createUser = asyncHandler(async (req, res) => {
  try {
    const datos = req.body;

    const email = await Users.findOne({ email: datos.email });
    if (email) {
      res.send({ message: "Email already exists" });
      return;
    } else {
      const password = await encrypt(req.body.password);
      const body = { ...req.body, password };
      const dataUser = await Users.create(body);
      dataUser.set("password", undefined, { strict: false });

      const data = {
        user: dataUser,
      };
      res.status(201);
      res.send({ data });
    }
  } catch (e) {
    console.log(e);
    handleHttpError(res, "ERROR_REGISTER_USER");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const cookies = req.cookies;
    const { email, password } = req.body;

    const foundUser = await Users.findOne({ email });

    if (!foundUser) {
      handleHttpError(res, "User Not Exist", 404);
      return;
    }

    if (foundUser.isBlocked) {
      handleHttpError(res, "User Blocked", 401);
      return;
    }

    const check = await compare(password, foundUser.password);

    if (!check) {
      handleHttpError(res, "PASSWORD INVALID", 401);
      return;
    } else {
      const roles = Object.values(foundUser.role);
      const accessToken = jwt.sign(
        {
          UserInfo: {
            _id: foundUser._id,
            email: foundUser.email,
            role: foundUser.role,
          },
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "10s",
        }
      );
      const newRefreshToken = jwt.sign(
        { user: foundUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Changed to let keyword
      let newRefreshTokenArray = !cookies?.jwt
        ? foundUser.refreshToken
        : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

      if (cookies?.jwt) {
        /* 
            Scenario added here: 
                1) User logs in but never uses RT and does not logout 
                2) RT is stolen
                3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
            */
        const refreshToken = cookies.jwt;
        const foundToken = await Users.findOne({ refreshToken }).exec();

        // Detected refresh token reuse!
        if (!foundToken) {
          console.log("attempted refresh token reuse at login!");
          // clear out ALL previous refresh tokens
          newRefreshTokenArray = [];
        }

        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
      }

      // Saving refreshToken with current user
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await foundUser.save();
      console.log(result);

      // Creates Secure Cookie with refresh token
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Send authorization roles and access token to user
      res.json({ accessToken, _id: foundUser._id, user: foundUser });
    }
  } catch (e) {
    console.log(e);
    handleHttpError(res, "ERROR_LOGIN_USER");
  }
});


 const getUser = asyncHandler(async (req, res) => {
   try {
    const { _id } = req.user;
     console.log(_id);
     validateMongoDbId(_id);
     const user = await Users.findById(_id);
     if (!user) {
       handleHttpError(res, "User Not Exist", 404);
       return;
     }
     user.set("password", undefined, { strict: false });
     res.status(200);
     res.send({ data: user });
   } catch (e) {
     console.log(e);
     handleHttpError(res, "ERROR_GET_USER");
   }
 });

const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const { firstname, lastname, email, password } = req.body;
    const user = await Users.findById(id);
    if (!user) {
      handleHttpError(res, "User Not Exist", 404);
      return;
    }
    const check = await compare(password, user.password);
    if (!check) {
      handleHttpError(res, "PASSWORD INVALID", 401);
      return;
    }
    const hashPassword = await encrypt(password);
    const data = await Users.findByIdAndUpdate(
      id,
      {
        firstname,
        lastname,
        email,
        password: hashPassword,
      },
      { new: true }
    );

    res.status(200);
    res.send({ data });
  } catch (e) {
    console.log(e);
    handleHttpError(res, "ERROR_UPDATE_USER");
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  const foundUser = await Users.findOne({ refreshToken }).exec();

  //Detected refresh token reuse!
  if (!foundUser) {
    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, user) => {
      if (err) return res.sendStatus(403);
      const hackedUser = await Users.findById(user._id);
      hackedUser.refreshToken = [];
      const result = await hackedUser.save();
      console.log(result);
    });
    return res.sendStatus(403);
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (token) => token !== refreshToken
  );

  // evaluate jwt
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      foundUser.refreshToken = [...newRefreshTokenArray];
      const result = await foundUser.save();
    }
    if (err || foundUser._id !== user._id) return res.sendStatus(403);

    //Refresh token was still valid
    const roles = Object.values(user.role);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          _id: user._id,
          email: user.email,
          role: roles,
        },
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10s",
      }
    );

    const newRefreshToken = jwt.sign(
      { user: foundUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    //Saving refreshToken with current user
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const result = await foundUser.save();

    //Create Secure Cookie with refrsh token
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.json({ roles, accessToken });
  });
});

const handleLogout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  //Is refreshToken in DB?
  const foundUser = await Users.findOne({ refreshToken }).exec();
  console.log(foundUser);
  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.sendStatus(204);
  }

  foundUser.refreshToken = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  foundUser.refreshToken = [];
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.sendStatus(204);
});

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
      handleHttpError(res, "User Not Exist", 404);
      return;
    }

    const token = uuidv4();
    await user.updateOne({
      passwordResetToken: token,
      passwordResetExpires: Date.now() + 3600000,
    });
    const resetUrl = `Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href='http://localhost:3001/api/users/reset-password/${token}' target='_blank'>Click here</a>`;
    const data = {
      email: user.email,
      subject: "Forgot Password Link",
      text: "Reset Password",
      html: resetUrl,
    };
    sendEmail(data);
    res.status(200);
    res.send({ message: "Reset password link sent to your email", token });
    res.end();
  } catch (error) {}
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const user = await Users.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    handleHttpError(res, "Token is invalid or has expired", 404);
    return;
  }
  const hashPassword = await encrypt(password);
  await user.updateOne({
    password: hashPassword,
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
    passwordChangedAt: Date.now(),
  });
  res.status(200);
  res.send({ message: "Password reset successful", user });
  res.end();
});

const cartFill = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  //Is refreshToken in DB?
  const foundUser = await Users.findOne({ refreshToken }).exec();
  //console.log(foundUser);
  try {
    let products = [];
    const user = await Users.findById(foundUser._id);
    //check if user already has a cart
    const existingCart = await Cart.findOne({ orderedBy: user._id });
    if (existingCart) {
      existingCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      //get price for creating total
      let { price } = await Products.findById(cart[i]._id)
        .select("price")
        .exec();
      object.price = price;
      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }

    let newCart = await new Cart({
      products,
      cartTotal,
      orderedBy: user._id,
    }).save();

    res.status(200);
    res.json(newCart);
  } catch (error) {
    handleHttpError(res, "ERROR_USER_CART");
  }
});

const cartUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  console.log(_id);
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ 
      $and: [{ orderedBy: _id }]
    }).populate(
      "products.product"
    ).exec();
    res.json(cart);
  } catch (error) {
    handleHttpError(res, "ERROR_USER_CART");
  }
  
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  console.log(_id);
  validateMongoDbId(_id);
  try {
    const user = await Users.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderBy: user._id });
    res.json(cart);
  } catch (error) {
    handleHttpError(res, "ERROR_REMOVE_CART");
  }

});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const validCoupon = await Coupons.findOne({ name: coupon }).exec();
  if (!validCoupon) {
    handleHttpError(res, "Invalid Coupon", 404);
    return;
  }
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {

    const user = await Users.findById(_id);
    let { cartTotal } = await Cart.findOne({ orderedBy: user._id }).populate(
      "products.product"
    ).exec();
    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);

    await Cart.findOneAndUpdate(
      { orderedBy: user._id },
      { totalAfterDiscount },
      { new: true }
    );

    res.json(totalAfterDiscount);
    
  } catch (error) {
    handleHttpError(res, "ERROR_USER_CART");
    
  }

});


const createOrder = asyncHandler(async (req, res) => {
  const {couponApplied} = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await Users.findById(_id);
    let usercart = await Cart.findOne({ orderedBy: user._id }).exec();
    let finalAmount = 0;
    if(couponApplied && usercart.totalAfterDiscount){
      finalAmount = usercart.totalAfterDiscount * 100;
    }else{
      finalAmount = usercart.cartTotal * 100;
    }

    let newOrder = await new Order({
      products: usercart.products,
      paymentIntent: {
        id: uuidv4(),
        amount: finalAmount,
        currency: "usd",
        status: "Not Paid",
        created: Date.now(),
        payment_method_types: ["card"],
      },
      orderedBy: user._id,
      orderStatus: "Not Processed",
    }).save();

    let update = usercart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    }
    );

    const bulkOption = await Products.bulkWrite(update, {});
    console.log(bulkOption);
    res.json(newOrder);
    
  } catch (error) {
    handleHttpError(res, "ERROR_CREATE_ORDER");
    
  }

});


const getOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const orders = await Order.find({ orderedBy: _id }).populate(
      "products.product"
    ).exec();
    res.json(orders);
  } catch (error) {
    handleHttpError(res, "ERROR_GET_ORDER");
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, orderStatus } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updateOrders = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, paymentIntent: { status: orderStatus } },
      { new: true }
    );
    res.json(updateOrders);
  } catch (error) {
    handleHttpError(res, "ERROR_GET_ORDER");
  }
});

module.exports = {
  createUser,
  loginUser,
  getUser,
  updateUser,
  handleRefreshToken,
  handleLogout,
  forgotPassword,
  resetPassword,
  cartFill,
  cartUser,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrder,
  updateOrderStatus
};
