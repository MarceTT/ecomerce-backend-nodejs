const Admin = require('../models/admin');
const Users = require("../models/user");
const asyncHandler = require("express-async-handler");
const { handleHttpError } = require("../helpers/handleErrors");
const { encrypt, compare } = require("../helpers/handleBcrypt");
const { tokenSign } = require("../helpers/handlejwt");
const validateMongoDbId = require("../helpers/handleMongoId");
const jwt = require("jsonwebtoken");



const registerAdmin = asyncHandler(async (req, res) => {
    try{
    
        const datos = req.body;
    
        const user_email = await Admin.findOne({ email: datos.email });
    
        if (user_email) {
            res.send({ message: "Email already exists" });
            return;
            } else {
            req = matchedData(req);
            const password = await encrypt(req.password);
            const body = { ...req, password };
            const dataUser = await Admin.create(body);
            dataUser.set("password", undefined, { strict: false });
            
            const data = {
                token: await tokenSign(dataUser),
                user: dataUser,
            };
            res.status(201)
            res.send({ data });
            }
    
        
    }catch(e){
        console.log(e)
        handleHttpError(res, "ERROR_REGISTER_USER")
    }
    });


const loginAdmin = asyncHandler(async (req, res) => {

   try {
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

    let accessToken;

    if (!check) {
        handleHttpError(res, "PASSWORD INVALID", 401);
        return;
    }else{
         accessToken = jwt.sign(
            {
                _id: foundUser._id,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "10s",
            }
          );

          refreshToken = jwt.sign(
            {
                _id: foundUser._id,
            },
            process.env.REFRESH_JWT_TOKEN,
            {
              expiresIn: "5h",
            }
          );
    }

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
    });

    res.json({
        success: true,
        message: "Logged in successfully",
    });
    
   } catch (error) {
         console.log(error)
         handleHttpError(res, "ERROR_LOGIN_USER")
    
   }

});



const getUsers = asyncHandler(async (req, res) => {
     try{
         const users = await Users.find();
         res.json(users)
     }catch(e){
         console.log(e)
         handleHttpError(res, "ERROR_GET_USERS")
     }
});


const chnageState = asyncHandler(async (req, res) => {
    try{
        const {id} = req.params;
        validateMongoDbId(id);
        const user = await Users.findById(id);
        if(!user){
            handleHttpError(res, "USER_NOT_FOUND", 404);
            return
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        user.set('password', undefined, {strict:false})
        user.set('createdAt', undefined, {strict:false})
        user.set('updatedAt', undefined, {strict:false})
        res.send({user, message: "User blocked"})
    }catch(e){
        console.log(e)
        handleHttpError(res, "ERROR_BLOCK_USER")
    }
});


const getProfile = asyncHandler(async (req, res) => {
    try{
        const userId = req.user;
        console.log(userId);
         const user = await Users.findById(userId._id);
         if(!user){
             handleHttpError(res, "USER_NOT_FOUND", 404);
             return
         }
         user.set('password', undefined, {strict:false})
         user.set('createdAt', undefined, {strict:false})
         user.set('updatedAt', undefined, {strict:false})
         res.json(user)
    }catch(e){
        console.log(e)
        handleHttpError(res, "ERROR_GET_PROFILE")
    }
});

 const refreshTokenAdmin = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = req.cookies;

    try {
        // Intenta verificar el accessToken primero
        jwt.verify(accessToken, process.env.JWT_SECRET);
        next();
    } catch (error) {
        // Procede solo si el accessToken ha expirado
        if (error.name === 'TokenExpiredError') {
            try {
                // Verifica el refreshToken
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_TOKEN);

                // Si el refreshToken es válido, genera nuevos tokens
                const newAccessToken = jwt.sign(
                    { _id: decoded._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '5h' }
                );

                const newRefreshToken = jwt.sign(
                    { _id: decoded._id },
                    process.env.REFRESH_JWT_TOKEN,
                    { expiresIn: '10h' }
                );

                res.cookie('accessToken', newAccessToken, { httpOnly: true , secure: false});
                res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: false });

                return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
            } catch (refreshError) {
                // Maneja el error del refreshToken (expirado o inválido)
                return res.status(403).json({ message: 'Invalid or Expired Refresh Token' });
            }
        }

        // En caso de otros errores con el accessToken
        return res.status(403).json({ message: 'Invalid Access Token' });
    }
});

const logoutAdmin = asyncHandler(async (req, res) => {
    try{
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({message: "Logout successfully"})
    }catch(e){
        console.log(e)
        handleHttpError(res, "ERROR_LOGOUT_USER")
    }
});







module.exports = { registerAdmin, loginAdmin, getUsers, chnageState, getProfile, refreshTokenAdmin, logoutAdmin};