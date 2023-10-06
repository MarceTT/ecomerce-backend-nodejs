const bcrypt = require('bcryptjs');


const encrypt = async (passwordPlain) => {
    const hash =  bcrypt.hash(passwordPlain,10)
    return hash;
}

const compare = async (passwordData, hashPassword) => {
    return bcrypt.compare(passwordData, hashPassword);
}


module.exports = { encrypt, compare};