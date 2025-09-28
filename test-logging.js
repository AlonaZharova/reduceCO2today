// Test script to verify logging functionality
const mongoose = require('mongoose');
const Log = require('./models/Log');

// Connect to MongoDB (you'll need to set your MONGODB_URI in .env)
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

async function testLogging() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Create a test log entry
        const testLog = new Log({
            method: 'GET',
            url: '/test',
            ip: '127.0.0.1',
            userAgent: 'Test User Agent',
            statusCode: 200,
            responseTime: 150
        });

        // Save the test log
        await testLog.save();
        console.log('Test log saved successfully');

        // Retrieve and display the log
        const logs = await Log.find().sort({ timestamp: -1 }).limit(5);
        console.log('\nRecent logs:');
        logs.forEach(log => {
            console.log(`${log.timestamp}: ${log.method} ${log.url} - ${log.ip} (${log.statusCode})`);
        });

        console.log('\nLogging test completed successfully!');
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testLogging();


