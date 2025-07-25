const express = require("express");
const router = express.Router();
const Email = require("../models/Email");
const crypto = require('crypto');


function generateEmailHash(email) {
  // Hash the email using SHA-256
  const hash = crypto.createHash('sha256').update(email).digest('hex');

  return hash;
};

router.get('/', async(req, res) => {
    try {

        userEmail = req.query;
        unsubscribeHash = userEmail.emailHash;

        // Compare the emailHash with all hashes in my database

        const emailSubs = await Email.find({});

        let unsubscribePromise;

        emailSubs.forEach((email) => {
            emailHash = generateEmailHash(String(email));
            if (emailHash == unsubscribeHash) {
                console.log("email hashes match!")

                unsubscribePromise = Email.findOneAndDelete({ email: email.email });
            }
        });

        await unsubscribePromise;
        console.log("Email deleted successfully");


        return res.render("unsubscribe");
    } catch (error) {
        return res.render("error");
    }
});



module.exports = router;