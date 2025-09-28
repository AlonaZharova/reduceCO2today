const mongoose = require('mongoose');

// Schema for Log
const logSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    statusCode: {
        type: Number,
        required: false
    },
    responseTime: {
        type: Number,
        required: false
    }
}, { timestamps: true });  // Enable timestamps

// Create the model from the schema
const Log = mongoose.model('Log', logSchema);

module.exports = Log;


