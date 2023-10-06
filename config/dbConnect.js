const mongoose = require('mongoose');
require('dotenv').config();


const dbConnection = () => {
    const URL = process.env.DB_URI;
    mongoose.connect(URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
        }).then(() => {
            console.log('DB Connected',`http://localhost:${process.env.PORT}`);
        }
    ).catch(err => {
        console.log('DB Connection Error: ', err);
    }
    );
}

module.exports = dbConnection;