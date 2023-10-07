const mongoose = require('mongoose');


const OrderSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            count: Number,
            color: String,
        }
    ],
    paymentIntent: {},
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
    orderedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
