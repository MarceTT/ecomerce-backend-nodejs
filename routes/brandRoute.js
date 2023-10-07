const express = require("express");
const router = express.Router();
const { createBrand, updateBrand, deleteBrand, getBrand, getAllBrands } = require("../controllers/brandController");
const userMiddleware  = require('../middlewares/userMiddleware');
const checkRole = require('../middlewares/rolMiddleware');



//route with middleware
router.post('/create-brand', userMiddleware, checkRole, createBrand);
router.put('/update-brand/:id', userMiddleware, checkRole, updateBrand);
router.delete('/delete-brand/:id', userMiddleware, checkRole, deleteBrand);

//route without middleware
router.get('/get-brand/:id', getBrand);
router.get('/get-all-brands', getAllBrands);



module.exports = router;