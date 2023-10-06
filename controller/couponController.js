const Coupon = require("../models/coupon");
const { handleHttpError } = require("../helpers/handleErrors");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../helpers/handleMongoId");

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.status(200);
    res.json(newCoupon);
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_COUPON");
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    validateMongoDbId(id);
    try {
        const updateCoupon = await Coupon.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        res.status(200);
        res.json(updateCoupon);
        
    } catch (error) {
        handleHttpError(res, "ERROR_UPDATE_COUPON");
        
    }
});


const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deleteCoupon = await Coupon.findByIdAndDelete(id);
        res.status(200);
        res.json(deleteCoupon);
    } catch (error) {
        handleHttpError(res, "ERROR_DELETE_COUPON");
        
    }
});

const getCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const coupon = await Coupon.findById(id);
        res.status(200);
        res.json(coupon);
        
    } catch (error) {
        handleHttpError(res, "ERROR_GET_COUPON");
        
    }
});

const getAllCoupons = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.status(200);
        res.json(coupons);
    } catch (error) {
        handleHttpError(res, "ERROR_GET_COUPONS");
        
    }
});

module.exports = {
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCoupon,
    getAllCoupons
};
