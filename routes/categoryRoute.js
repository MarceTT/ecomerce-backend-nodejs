const express = require("express");
const router = express.Router();
const {createCategory, updateCategory, deleteCategory, getCategory, getallCategory} = require("../controller/categoryController");
const userMiddleware  = require('../middlewares/userMiddleware');
const checkRole = require('../middlewares/rolMiddleware');


router.post('/create-category', userMiddleware, checkRole, createCategory);
router.put('/update-category/:id', userMiddleware, checkRole, updateCategory);
router.delete('/delete-category/:id', userMiddleware, checkRole, deleteCategory);
router.get('/get-category/:id', userMiddleware, getCategory);
router.get('/get-all-category', userMiddleware, getallCategory);


module.exports = router;