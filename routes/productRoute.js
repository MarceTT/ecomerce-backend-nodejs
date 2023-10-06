const express = require("express");
const router = express.Router();
const {createProduct, updateProduct, deleteProduct, getaProduct, getAllProduct, addToWishlist, rating} = require("../controller/productsController");
const userMiddleware  = require('../middlewares/userMiddleware');
const checkRole = require('../middlewares/rolMiddleware');



router.post('/create-product', userMiddleware, checkRole, createProduct);
router.put('/update-product/:id', userMiddleware, checkRole, updateProduct);
router.delete('/delete-product/:id', userMiddleware, checkRole, deleteProduct);
router.get('/get-product/:id', userMiddleware, getaProduct);
router.get('/get-all-product', userMiddleware, getAllProduct);
router.put('/add-to-wishlist/:id', userMiddleware, addToWishlist);
router.put('/rating/:id', userMiddleware, rating);



module.exports = router;