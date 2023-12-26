const express = require('express');
const router = express.Router();
const {registerAdmin, loginAdmin, getUsers, chnageState, getProfile, refreshTokenAdmin, logoutAdmin} = require('../controller/adminController');
const userMiddleware  = require('../middlewares/userMiddleware');
const { verifyTokenAdmin } = require('../middlewares/adminMiddleware');
const checkRole = require('../middlewares/rolMiddleware');


//route without middleware
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);


//routes with middleware
router.get('/users-admin', verifyTokenAdmin, getUsers);
router.get('/profile', verifyTokenAdmin, getProfile);
router.put('/change-state/:id', userMiddleware, checkRole, chnageState);
router.post('/refresh-token', refreshTokenAdmin);
router.post('/logout', verifyTokenAdmin, logoutAdmin);





module.exports = router;