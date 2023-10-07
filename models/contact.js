const mongoose = require('mongoose');



const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    email:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    phone:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    message:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    }
});

const Contact = mongoose.model('Contact', contactSchema);