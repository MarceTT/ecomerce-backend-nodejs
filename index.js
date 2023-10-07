const express = require('express');
const cors = require('cors');
const dbConnection = require('./config/dbConnect');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const morgan = require('morgan');



const user_routes = require('./routes/userRoute');
const admin_routes = require('./routes/adminRoute');
const product_routes = require('./routes/productRoute');
const category_routes = require('./routes/categoryRoute');
const coupon_routes = require('./routes/couponRoute');
const contact_routes = require('./routes/contactRoute');




dbConnection();

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json({ limit: "500mb", extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());



//admin routes
app.use("/api/admin", admin_routes);
//user routes
app.use("/api/users", user_routes);
//product routes
app.use("/api/products", product_routes);
//category routes
app.use("/api/categories", category_routes);
//coupon routes
app.use("/api/coupons", coupon_routes);
//contact routes
app.use("/api/contacts", contact_routes);


app.listen(PORT , () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
    });

// Path: package.json
