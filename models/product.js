const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    band: {
        type: String,
        required: true,
    },
    slug: {
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String, 
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number, 
        required: true
    },
    image: {
        public_id: String,
        url: String,
    },
    tags: {
        type: String,
    },
    color: [],
    ratings: [  
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            star: Number,
            comments: String,
        }
    ],
    totalRating: {
        type: Number,
        default: 0,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
    },
    sold: {
        type: Number,
        default: 0,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
}, 
{
    timestamps: true,
    versionKey: false
}
);

module.exports = mongoose.model('Product', ProductSchema);