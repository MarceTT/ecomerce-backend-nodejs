const express = require("express");
const router = express.Router();
const {
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
} = require("../controller/productsController");
const userMiddleware = require("../middlewares/userMiddleware");
const { verifyTokenAdmin } = require('../middlewares/adminMiddleware');
const checkRole = require("../middlewares/rolMiddleware");
const {
  uploadPhotos,
  productImgResize,
} = require("../middlewares/uploadImages");

router.post("/create-product", verifyTokenAdmin, uploadPhotos.array("image", 5), productImgResize, createProduct);
router.put("/update-product/:id", userMiddleware, checkRole, updateProduct);
router.put(
  "/upload",
  uploadPhotos.array("image", 5),
  productImgResize,
  uploadImages
);
router.delete("/delete-product/:id", userMiddleware, checkRole, deleteProduct);
router.get("/get-product/:slug", getaProduct);
router.get("/get-all-product", getAllProduct);
router.put("/add-to-wishlist/:id", userMiddleware, addToWishlist);
router.put("/rating/:id", userMiddleware, rating);
router.get("/product-by-letter/:letter", productByLetter);
router.get("/get-all-bands", getAllBands);

// Admin
router.get("/get-all-products-admin", verifyTokenAdmin, getAllProductsAdmin);
router.get("/get-product-admin/:id", verifyTokenAdmin, getProductAdmin);
router.post("/update-product-admin", verifyTokenAdmin, updateProductAdmin);
router.delete("/delete-img-admin/:id",  deleteImage);

module.exports = router;
