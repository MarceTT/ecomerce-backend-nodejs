const jsonwebtoken = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const tokenSign = async (user) => {
    const sign = jsonwebtoken.sign({
        _id: user._id,
        role: user.role,
    },
        JWT_SECRET,
        {
            expiresIn: '30d',
        },
    ); 

    return sign;
}



const tokenVerify = async (token) => {
    try {
        return jsonwebtoken.verify(token, JWT_SECRET);
        
    } catch (error) {
        return null;
        
    }
}

module.exports = { tokenSign, tokenVerify };