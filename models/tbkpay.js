const mongoose = require('mongoose');

const TbkOrderPay = new mongoose.Schema({
    buyOrder: {
        type: String,
        required: true,
    },
    vci: {
        type: String,
    },
    status: {
        type: String,
    },
    carDetail: {
        type: String,
    },
    accoutingDate: {
        type: String,
    },
    transactionDate: {
        type: String,
    },
    authorizationCode: {
        type: String,
    },
    paymentTypeCode: {
        type: String,
    },
    responseCode: {
        type: Number,
    },
    installmentsNumber: {
        type: Number,
    },
    sessionId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
}, { timestamps: true });


module.exports = mongoose.model('TbkOrderPay', TbkOrderPay);