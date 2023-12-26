const Product = require("../models/product");
const Users = require("../models/user");
const validateMongoDbId = require("../helpers/handleMongoId");
const { handleHttpError } = require("../helpers/handleErrors");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const { cloudinaryUploadImg, cloudynaryDeleteImg } = require("../helpers/handleCloudinary");
const fs = require("fs");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const newProduct = await Product.create(req.body);
    if(newProduct){
      const productUploadImage = await Product.findById(newProduct._id);

      const uploader = async (path) => await cloudinaryUploadImg(path, "images");
      const urls = [];
      const files = req.files;
      for (const file of files) {
        const { path } = file;
        const newPath = await uploader(`public/images/resized_${file.filename}`);
        urls.push(newPath);
        console.log(newPath);
        fs.unlinkSync(`public/images/resized_${file.filename}`);
      }
      const updatedImages = [...productUploadImage.images, ...urls];
 
      const updateProduct = await Product.findByIdAndUpdate(
        newProduct._id,
        { images: updatedImages },
        {
          new: true,
        }
      );
    }
    res.status(200);
    res.json({
      productId: newProduct._id, //Aquí obtienes el ID del producto
      product: updateProduct
    });
  } catch (e) {
    console.error(e);
    handleHttpError(res, "ERROR_CREATE_PRODUCT");
  }
});

const updateProduct = async (req, res) => {
  //console.log(mongoose.Types.ObjectId(req.params));
  const data = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const updateProduct = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    //console.log(updateProduct);

    //res.status(200);
    res.json(updateProduct);
  } catch (error) {
    handleHttpError(res, "ERROR_UPDATED_PRODUCT");
  }
};

const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params;
  validateMongoDbId(id);
  try {
    const deleteProduct = await Product.findOneAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    handleHttpError(res, "ERROR_DELETE_PRODUCT");
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  try {
    const findProduct = await Product.findOne({ slug: slug });
    //console.log(findProduct);
    res.json(findProduct);
  } catch (error) {
    handleHttpError(res, "ERROR_GET_PRODUCTS");
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Obtener el conteo total de productos para la paginación
    const productCount = await Product.countDocuments(JSON.parse(queryStr));

    query = query.skip(skip).limit(limit);
    const product = await query;
    res.json({ product, productCount });
  } catch (error) {
    throw new Error(error);
  }
});
const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await Users.findById(_id);
    const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyadded) {
      let user = await Users.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await Users.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    handleHttpError(res, "ERROR_RATING_PRODUCT");
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const data = req.body;
  const { productId } = data;
   validateMongoDbId(productId);
   try {
     const product = await Product.findById(productId);
     if (!product) {
       res.status(404);
       throw new Error('Product not found');
     }

     const uploader = async (path) => await cloudinaryUploadImg(path, "images");
     const urls = [];
     const files = req.files;
     for (const file of files) {
       const { path } = file;
       const newPath = await uploader(`public/images/resized_${file.filename}`);
       urls.push(newPath);
       console.log(newPath);
       fs.unlinkSync(`public/images/resized_${file.filename}`);
     }
     const updatedImages = [...product.images, ...urls];

     const updateProduct = await Product.findByIdAndUpdate(
      productId,
       { images: updatedImages },
       {
         new: true,
       }
     );
     res.json(updateProduct);
   } catch (error) {
     console.error("Error:", error);
     handleHttpError(res, "ERROR_UPLOAD_IMAGES");
   }
});


const deleteImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await cloudynaryDeleteImg(id);
    await Product.updateMany(
      { 'images.public_id': id },
      { $pull: { images: { public_id: id } } }
    );
    res.json({ message: "Deleted", deleted });
  }catch (error) {
    console.error("Error:", error);
    handleHttpError(res, "ERROR_UPLOAD_IMAGES");
  }
});

const productByLetter = asyncHandler(async (req, res) => {
  try {
    let { letter } = req.params;
    let query = {};
    if (letter !== "#") {
      // Utiliza una expresión regular para buscar por la primera letra
      // 'i' para ignorar mayúsculas y minúsculas
      query.band = new RegExp(`^${letter}`, "i");
    } else if (letter === "#") {
      // Si la letra es '#' entonces busca los que no empiezan con una letra
      query.band = { $regex: "^[^a-zA-Z]" };
    }
    const product = await Product.find(query);
    res.json(product);
  } catch (error) {
    handleHttpError(res, "ERROR_GET_PRODUCTS");
  }
});

const getAllBands = asyncHandler(async (req, res) => {
  try {
    const product = await Product.find();
    const uniqueBands = Array.from(
      new Set(product.map((band) => band.band))
    ).map((name) => {
      return product.find((band) => band.band === name);
    });
    const bandCounts = product.reduce((bands, product) => {
      bands[product.band] = (bands[product.band] || 0) + 1;
      return bands;
    }, {});
    const allBandsCount = await Product.countDocuments();
    res.json({ uniqueBands, allBandsCount });
  } catch (error) {
    handleHttpError(res, "ERROR_GET_PRODUCTS");
  }
});

const getAllProductsAdmin = asyncHandler(async (req, res) => {
   try {
     const product = await Product.find().sort({ createdAt: -1 });
     res.json(product);
   } catch (error) {}
});

const getProductAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const product = await Product.findById(id);
    res.json(product);
  } catch (error) {}
});

const updateProductAdmin = asyncHandler(async (req, res) => {
  const data = req.body;
   const { id } = data;
   validateMongoDbId(id);
    try {
      if (req.body.name) {
        req.body.slug = slugify(req.body.name);
      }
      const updateProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      console.log(updateProduct);

      res.status(200);
      res.json(updateProduct);
    } catch (error) {
      handleHttpError(res, "ERROR_UPDATED_PRODUCT");
    }
});

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getaProduct,
  getAllProduct,
  addToWishlist,
  rating,
  uploadImages,
  productByLetter,
  getAllBands,
  getAllProductsAdmin,
  getProductAdmin,
  updateProductAdmin,
  deleteImage
};
