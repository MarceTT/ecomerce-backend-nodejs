const { handleHttpError } = require("../helpers/handleErrors");
const { tokenVerify } = require("../helpers/handlejwt");
const asyncHandler = require("express-async-handler");
const Users = require("../models/user");

const checkRole = asyncHandler(async(req, res, next) => {
  const cookies = req.cookies;
  try {
    if(!cookies?.jwt){
      handleHttpError(res, "NEED_ ESSION", 401);
      return;
    }
    const token = cookies.jwt;
    const dataToken = await tokenVerify(token);

    if(!dataToken.user){
      handleHttpError(res, "NOT PAYLOAD DATA", 401);
      return;
    }

    const checkValueRole = await Users.findById(dataToken.user).select('-refreshToken');
    //console.log(checkValueRole.role)


     if(checkValueRole.role !== "admin"){
       handleHttpError(res, "USER_NOT_PERMISSIONS", 403);
       return;
     }
     next();
    
  } catch (error) {
    handleHttpError(res, "ERROR_PERMISSIONS", 403);
    
  }
});

module.exports = checkRole;