const jsonwebtoken = require('jsonwebtoken');

const generateRefreshToken = async (user) => {
    const refreshToken = jsonwebtoken.sign({
        _id: user._id,
        role: user.role,
    },
        process.env.JWT_SECRET,
        {
            expiresIn: '3d',
        },
    ); 

    return refreshToken;
}

module.exports = { generateRefreshToken };