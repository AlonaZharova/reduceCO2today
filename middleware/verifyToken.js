const APIKeys = require("../models/APIKeys");


module.exports = async (req, res, next) => {

    const apiKey = req.headers.apitoken;
   
    const existingApiKey = await APIKeys.findOne({ apikey: apiKey });

    if (!existingApiKey) {
        const error = new Error("Invalid Token");
        error.status = 401; 
        return next(error);
    }
  
    next();
  }