const Brand = require('../models/brand');
const asyncHandler = require("express-async-handler");
const { handleHttpError } = require("../helpers/handleErrors");
const validateMongoDbId = require("../utils/validateMongodbId");


const createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.status(200);
        res.json(newBrand);
    } catch (error) {
        handleHttpError(res, "ERROR_CREATE_BRAND");
    }
});

const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    validateMongoDbId(id);
    try {
        const updateBrand = await Brand.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        res.status(200);
        res.json(updateBrand);
        
    } catch (error) {
        handleHttpError(res, "ERROR_UPDATE_BRAND");
        
    }
});

const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteBrand = await Brand.findByIdAndDelete(id);
        res.status(200);
        res.json(deleteBrand);
    } catch (error) {
        handleHttpError(res, "ERROR_DELETE_BRAND");
        
    }
});

const getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const brand = await Brand.findById(id);
        res.status(200);
        res.json(brand);
        
    } catch (error) {
        handleHttpError(res, "ERROR_GET_BRAND");
        
    }
});

const getAllBrands = asyncHandler(async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200);
        res.json(brands);
        
    } catch (error) {
        handleHttpError(res, "ERROR_GET_ALL_BRANDS");
        
    }
});


module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getAllBrands,
};