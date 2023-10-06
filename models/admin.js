const mongoose = require('mongoose');


const AdminSchema = new mongoose.Schema({
    firstname: {
        type: String, 
        required: true
    },
    lastname: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        unique: true, 
        required: true
    },
    password: {
        type: String, 
        required: true
    },
    role: {
        type: String,
        default: 'admin',
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },

    passwordChangedAt: {type: Date},
    passwordResetToken: {type: String},
    passwordResetExpires: {type: Date},
}, 
{
    timestamps: true,
    versionKey: false
}
);

module.exports = mongoose.model('Admin', AdminSchema);