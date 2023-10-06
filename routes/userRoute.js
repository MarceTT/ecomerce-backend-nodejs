const express = require('express');
const router = express.Router();
const { createUser, loginUser, getUser, updateUser, handleRefreshToken, handleLogout, forgotPassword, resetPassword } = require('../controller/userController');
const userMiddleware  = require('../middlewares/userMiddleware');
const checkRole = require('../middlewares/rolMiddleware');



router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/:id', userMiddleware, getUser);
router.put('/:id', updateUser);
router.post('/refresh-token', handleRefreshToken);
router.post('/logout', handleLogout);


module.exports = router;