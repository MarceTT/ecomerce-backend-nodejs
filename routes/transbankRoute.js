const express = require("express");
const router = express.Router();
const { createTransaction, commitTransaction } = require("../controller/transbankController");

router.post("/create-transaction", createTransaction);
router.post("/commit-transaction", commitTransaction);

module.exports = router;