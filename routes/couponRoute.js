const express = require('express');
const router = express.Router();
const {createCoupon, updateCoupon, deleteCoupon, getCoupon, getAllCoupons} = require('../controller/couponController');
const userMiddleware  = require('../middlewares/userMiddleware');
const checkRole = require('../middlewares/rolMiddleware');


//route without middleware
router.post('/create-coupon', userMiddleware, checkRole, createCoupon);
router.put('/update-coupon/:id', userMiddleware, checkRole, updateCoupon);
router.delete('/delete-coupon/:id', userMiddleware, checkRole, deleteCoupon);
router.get('/get-coupon/:id', getCoupon);
router.get('/get-all-coupons', userMiddleware, checkRole, getAllCoupons);


module.exports = router;