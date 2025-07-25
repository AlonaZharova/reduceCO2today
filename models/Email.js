// Example Subscriber model (adjust fields as necessary)
const { Schema, model } = require("mongoose");


const emailSchema = new Schema({
  email: { type: String, required: true },
  region: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


const Email = model('Email', emailSchema); // Correct the casing of regiondataSchema

module.exports = Email;


