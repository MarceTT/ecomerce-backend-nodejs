const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../helpers/handleMongoId");



const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.status(200);
        res.json(newCategory);
    } catch (e) {
        handleHttpError(res, "ERROR_CREATE_CATEGORY");
    }
});


const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    validateMongoDbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
          });
        res.json(updatedCategory);
        
    } catch (error) {
        handleHttpError(res, "ERROR_UPDATE_CATEGORY");
    }
});


const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteCategory = await Category.findByIdAndDelete(id);
        res.json(deleteCategory);
    } catch (error) {
        handleHttpError(res, "ERROR_DELETE_CATEGORY");
    }
});


const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const findCategory = await Category.findById(id);
        res.json(findCategory);
    } catch (error) {
        handleHttpError(res, "ERROR_GET_CATEGORY");
    }
});

const getallCategory = asyncHandler(async (req, res) => {
    try {
        const findCategory = await Category.find();
        res.json(findCategory);
    } catch (error) {
        handleHttpError(res, "ERROR_GET_CATEGORY");
    }
});


module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getallCategory
};