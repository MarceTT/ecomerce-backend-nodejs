const express = require('express');
const router = express.Router();
const {registerAdmin, loginAdmin, getUsers, chnageState} = require('../controller/adminController');
const userMiddleware  = require('../middlewares/userMiddleware');
const checkRole = require('../middlewares/rolMiddleware');


//route without middleware
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);


//routes with middleware
router.get('/users-admin', userMiddleware, checkRole, getUsers);
router.put('/change-state/:id', userMiddleware, checkRole, chnageState);





module.exports = router;