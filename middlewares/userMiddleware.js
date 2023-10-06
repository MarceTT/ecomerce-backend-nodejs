const Users = require("../models/user");
const jsonwebtoken = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const { handleHttpError } = require("../helpers/handleErrors");
const { tokenVerify } = require("../helpers/handlejwt");

const userMiddleware = asyncHandler(async (req, res, next) => {
    const cookies = req.cookies;
   try {

     if(!cookies?.jwt){
       handleHttpError(res, "NEED_SESSION", 401);
       return;
     }

     const token = cookies.jwt;
     const dataToken = await tokenVerify(token);
     

     if(!dataToken.user){
       handleHttpError(res, "NOT PAYLOAD DATA", 401);
       return;
     }


     const user = await Users.findById(dataToken._id).select('-refreshToken');
     req.user = user

     //console.log({user})

     next()

   } catch (error) {
     handleHttpError(res, "Not Authorized token", 401);
   }
});


module.exports = userMiddleware;