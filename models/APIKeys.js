// Example Subscriber model (adjust fields as necessary)
const { Schema, model } = require("mongoose");


const apikeySchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  apikey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


const APIKey = model('APIKey', apikeySchema); // Correct the casing of regiondataSchema

module.exports = APIKey;


