const Contact = require("../models/contact"); 
const asyncHandler = require("express-async-handler");



const createContact = asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;
    const contact = new Contact({ name, email, phone, message });
    const createdContact = await contact.save();
    res.status(201).json(createdContact);
});


const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({});
    res.json(contacts);
});


const getContactById = asyncHandler(async (req, res) => {

    const contact = await Contact.findById(req.params.id);

    if (contact) {
        res.json(contact);
    } else {
        res.status(404);
        throw new Error("Contact not found");
    }
});


const updateContact = asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (contact) {
        contact.name = name;
        contact.email = email;
        contact.phone = phone;
        contact.message = message;

        const updatedContact = await contact.save();
        res.json(updatedContact);
    } else {
        res.status(404);
        throw new Error("Contact not found");
    }
});


const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
        await contact.remove();
        res.json({ message: "Contact removed" });
    } else {
        res.status(404);
        throw new Error("Contact not found");
    }
}
);


module.exports = {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
};