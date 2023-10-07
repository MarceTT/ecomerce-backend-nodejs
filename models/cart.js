const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            count: Number,
            //color: String,
            price: Number,
        }
    ],
    cartTotal: Number,
    totalAfterDiscount: Number,
    orderedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);