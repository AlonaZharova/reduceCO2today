const mongoose = require('mongoose');

// Schema for WorldData
const worldDataSchema = new mongoose.Schema({
    zone: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        required: true
    }
}, { timestamps: true });  // Enable timestamps

// Create the model from the schema
const WorldData = mongoose.model('WorldData', worldDataSchema);

module.exports = WorldData; 