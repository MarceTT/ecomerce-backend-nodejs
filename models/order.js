const mongoose = require('mongoose');


const OrderSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            band: String,
            name: String,
            price: Number,
            quantity: Number,
        }
    ],
   transactionId: {
        type: String,
        required: true,
   },
   amount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        default: 'Not Processed',
        enum: [
            'Not Processed',
            'Processing',
            'Dispatched',
            'Cancelled',
            'Completed',
        ],
    },
    orderedBy: [
        {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        email: String,
        name: String,
    }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
