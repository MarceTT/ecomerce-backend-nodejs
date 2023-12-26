const WebpayPlus = require("transbank-sdk").WebpayPlus;
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require("transbank-sdk");
const { handleHttpError } = require("../helpers/handleErrors");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const TbkOrderPay = require("../models/tbkpay");
const Order = require("../models/order");


  const createTransaction = asyncHandler(async (req, res) => {
    const buyOrder = `B${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const sessionId = uuidv4();
    const data = req.body;
    //console.log(data);
     const { amount, products, user } = req.body;
     const returnUrl = req.protocol + "://" + "127.0.0.1:5173" + "/webpay_plus/commit";
      try {
         const createResponse = await (new WebpayPlus.Transaction()).create(
             buyOrder,
             sessionId,
             amount,
             returnUrl
           );

           const token = createResponse.token;
           const url = createResponse.url;

           const viewData = {
             token,
             url,
             returnUrl,
           };

             const newTbkOrderPay = new TbkOrderPay({
                 buyOrder: buyOrder,
                 sessionId: sessionId,
                 amount: amount,
                 token: token,
                 url: url,
             });

             await newTbkOrderPay.save();

            const newOrder = new Order({
                transactionId: token,
                user: user,
                products: products,
                amount: amount,
            });

            await newOrder.save();

           res.json(viewData);
         
         
      } catch (error) {
          console.error('Error creating transaction:', error);
          res.status(500).send(error.message);
          handleHttpError(res, "ERROR_CREATING_TRANSACTION");
        
      }
  });


  const commitTransaction = asyncHandler(async (req, res, next) => {
    let token = req.body.token;
      try {
        const commitResponse = await (new WebpayPlus.Transaction()).commit(token);
        let viewData = {
            token,
            commitResponse,
          };
          const updateData = {
            status: commitResponse.status,
            vci: commitResponse.vci,
            carDetail: commitResponse.card_detail.card_number,
            accoutingDate: commitResponse.accounting_date,
            transactionDate: commitResponse.transaction_date,
            authorizationCode: commitResponse.authorization_code,
            paymentTypeCode: commitResponse.payment_type_code,
            responseCode: commitResponse.response_code,
            installmentsNumber: commitResponse.installments_number,
          };
          const updateOrder = await TbkOrderPay.findOneAndUpdate({token: token}, {
            $set: updateData
          }, {new: true});
          await updateOrder.save();

          let statusOrder;

          if(commitResponse.status === 'AUTHORIZED'){
            statusOrder = 'Processing';

          } else if(commitResponse.status === 'FAILED'){
            statusOrder = 'Cancelled';
          }


          const updateStatus = await Order.findOneAndUpdate({transactionId: token}, {
            $set: {orderStatus: statusOrder}
            }, {new: true});

            await updateStatus.save();


          res.json(viewData);
      } catch (error) {
          console.error('Error creating transaction:', error);
          res.status(500).send(error.message);
          handleHttpError(res, "ERROR_CREATING_TRANSACTION");
        
      }
  });


  const transactionResponse = asyncHandler(async (req, res) => {
    try {
        const token = req.body.token;
        const statusResponse = await (new WebpayPlus.Transaction()).status(token);
        const viewData = {
            token,
            statusResponse,
          };
            res.json(viewData);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).send(error.message);
        handleHttpError(res, "ERROR_CREATING_TRANSACTION");
        
    }
  });


  const refundTransaction = asyncHandler(async (req, res) => {
    try {
        const { token, amount } = req.body;
        const refundResponse = await (new WebpayPlus.Transaction()).refund(token, amount);
        const viewData = {
            token,
            amount,
            refundResponse,
          };
            res.json(viewData);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).send(error.message);
        handleHttpError(res, "ERROR_CREATING_TRANSACTION");
        
    }
  });


  module.exports = {
    createTransaction,
    commitTransaction,
    transactionResponse
  };