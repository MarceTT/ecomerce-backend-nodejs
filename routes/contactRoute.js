const express = require("express");
const router = express.Router();
const {createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact} = require("../controller/contactController");


router.route("/").post(createContact).get(getContacts);
router.route("/:id").get(getContactById).put(updateContact).delete(deleteContact);


module.exports = router;