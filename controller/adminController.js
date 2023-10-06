const Admin = require('../models/admin');
const Users = require("../models/user");
const asyncHandler = require("express-async-handler");
const { handleHttpError } = require("../helpers/handleErrors");
const { encrypt, compare } = require("../helpers/handleBcrypt");
const { tokenSign } = require("../helpers/handlejwt");
const validateMongoDbId = require("../helpers/handleMongoId");



const registerAdmin = asyncHandler(async (req, res) => {
    try{
    
        const datos = req.body;
    
        const user_email = await Admin.findOne({ email: datos.email });
    
        if (user_email) {
            res.send({ message: "Email already exists" });
            return;
            } else {
            req = matchedData(req);
            const password = await encrypt(req.password);
            const body = { ...req, password };
            const dataUser = await Admin.create(body);
            dataUser.set("password", undefined, { strict: false });
            
            const data = {
                token: await tokenSign(dataUser),
                user: dataUser,
            };
            res.status(201)
            res.send({ data });
            }
    
        
    }catch(e){
        console.log(e)
        handleHttpError(res, "ERROR_REGISTER_USER")
    }
    });


const loginAdmin = asyncHandler(async (req, res) => {

});



const getUsers = asyncHandler(async (req, res) => {
    try{
        const users = await Users.find();
        res.send({users})
    }catch(e){
        console.log(e)
        handleHttpError(res, "ERROR_GET_USERS")
    }
});


const chnageState = asyncHandler(async (req, res) => {
    try{
        const {id} = req.params;
        validateMongoDbId(id);
        const user = await Users.findById(id);
        if(!user){
            handleHttpError(res, "USER_NOT_FOUND", 404);
            return
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        user.set('password', undefined, {strict:false})
        user.set('createdAt', undefined, {strict:false})
        user.set('updatedAt', undefined, {strict:false})
        res.send({user, message: "User blocked"})
    }catch(e){
        console.log(e)
        handleHttpError(res, "ERROR_BLOCK_USER")
    }
});






module.exports = { registerAdmin, loginAdmin, getUsers, chnageState};