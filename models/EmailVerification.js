// Example Subscriber model (adjust fields as necessary)
const { Schema, model } = require("mongoose");


const emailVerificationSchema = new Schema({
  email: { type: String, required: true },
  region: { type: String, required: true },
  token: { type: String, required: true  }
});


const EmailVerification = model('EmailVerification', emailVerificationSchema); // Correct the casing of regiondataSchema

module.exports = EmailVerification;


