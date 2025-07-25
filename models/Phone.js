// Example Subscriber model (adjust fields as necessary)
const { Schema, model } = require("mongoose");


const phoneSchema = new Schema({
  phone: { type: String, required: true },
  region: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


const Phone = model('Phone', phoneSchema); // Correct the casing of regiondataSchema

module.exports = Phone;


