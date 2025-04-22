require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// strating cron job
require("./controllers/cron-job");

// Handles http requests (express is node js framework)
const express = require("express");

// Handles the handlebars
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// Middleware to parse JSON bodies
app.use(express.json());

const verifyToken = require("./middleware/verifyToken");

// 👇 Start handling routes here

const subscribeRoutes = require('./routes/subscribe.routes'); // Adjust the path as needed
app.use('/subscribe', subscribeRoutes);

const unsubscribeRoutes = require('./routes/unsubscribe.routes'); // Adjust the path as needed
app.use('/unsubscribe', unsubscribeRoutes);

const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const apiRoutes = require("./routes/api.routes");
app.use("/api", verifyToken, apiRoutes)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

// Export the app
module.exports = app;
