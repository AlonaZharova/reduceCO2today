const express = require('express');
const router = express.Router();
const axios = require('axios');
const RegionData = require('../models/RegionData'); // Adjust the path as needed
const Email = require("../models/Email");
const Phone = require("../models/Phone");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const EmailVerification = require("../models/EmailVerification");



const regions = ["50Hertz", "TenneT", "TransnetBW", "Amprion"];

async function getAllEmailSubscriptions() {

    try {

      subscriptionData = await Email.find({});
      return subscriptionData;
      
    } catch (error) {
      console.log(error);
    }
  };

async function getLatestRegionsData () {

    try {

        const regionPromises = regions.map((region) => {
            return RegionData.findOne({ region }).sort({
                createdAt: -1,
              })
        });

        const latestRegionResults = await Promise.all(regionPromises);

        return latestRegionResults;
        
    } catch (error) {
        console.log(error)
    }
};

const extractHours = (forecastResult) => {

    // Extract time frames form text data
    const timeRangePattern =
      /(\b([01]?[0-9]|2[0-3]):[0-5][0-9] to \b([01]?[0-9]|2[0-3]):[0-5][0-9]\b)/g;
    let match;
    const hours = [];
    
    while ((match = timeRangePattern.exec(forecastResult)) !== null) {
      // Extract the start hour and end hour
      const startHour = match[0].split(":")[0]; // Get the hour before the first colon
      const endHour = match[0].split("to")[1].split(":")[0].trim(); // Get the hour before the second colon
  
      hours.push({
        start: parseInt(startHour, 10),
        end: parseInt(endHour, 10),
      });
    }
  
    return hours;
  };

  function generateUnsubscribeLink(email, baseUrl) {
    // Hash the email using SHA-256
    const hash = crypto.createHash('sha256').update(email).digest('hex');
  
    // Construct the unsubscribe link
    const unsubscribeLink = `${baseUrl}?emailHash=${hash}`;
  
    return unsubscribeLink;
  };

  const generateToken = () => {
    return crypto.randomBytes(32).toString('hex'); // Generates a 64-character random string
};

router.post('/', async (req, res) => {
  const { email, region } = req.body;
    try {
        // Logic to save or update the Email in the database
        const existingEmail = await Email.findOne({ email, region });
        if (existingEmail) {
            // Update existing Email if necessary
            console.log(`Email already exists for ${email} in ${region}`);
            res.status(200).json({message: "Email already exists"})
        } else {

            // Generate Token for verification Email

            const token = generateToken();

            // Create a new Email Verification
            const newEmailVerification = new EmailVerification({ email, region, token });
            await newEmailVerification.save();

            // Send Email for Confirmation
            GMAIL_PWD = process.env.GMAIL_PWD;

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'energyguideforecast@gmail.com',
                    pass: GMAIL_PWD
                }
                });

            let verifyOption = {
                from: 'energyguideforecast@gmail.com',
                bcc: email,
                subject: "Your subscription to a Cleaner Tomorrow",
                html: `
                <html>
                    <head>
                        <title>
                            Thank you for subscribing to A cleaner tomorrow!
                        </title>
                    </head>
                    <body>
                        To verify your subscription, please click the following link: <a href="https://cleaner-tomorrow-c93527173767.herokuapp.com/subscribe/verify/${token}">Subscribe</a>
                    </body>
                </html>`
                };
        
            
            transporter.sendMail(verifyOption, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
            });

            res.status(200).send('Email successful');
        }
        
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).send('Error processing Email');
    }
});

router.get('/verify/:token', async (req, res) => {
    const token = req.params.token;
      try {
          console.log("Token", token
          )
          // Logic to save or update the Email in the database
          const existingEmailVerification = await EmailVerification.findOne({ token });
          console.log(existingEmailVerification)
          if (existingEmailVerification) {

            // Logic to save or update the Email in the database
            const existingEmail = await Email.findOne({ email: existingEmailVerification.email, region: existingEmailVerification.region });
            if (existingEmail) {
                // Update existing Email if necessary
                res.render("emailVerification", {message: "Your Email is already registered for this regions daily recommendations."});
            } else {
                const newEmail = new Email({ email: existingEmailVerification.email, region: existingEmailVerification.region });
                await newEmail.save();
                // Send confirmation email
                res.render("emailVerification", {message: "You email was successfully verified! Enjoy our daily green energy forecasts."});

            }
            // Create a new Email
            
          } else {
            res.render("emailVerification", {message: "The verification token is invalid, please try to subscribe again."});

          }
          

      } catch (error) {
          console.error('Email error:', error);
          res.status(500).send('Error processing Email');
      }
  });

router.post('/whatsapp', async (req, res) => {
  const { phone, region } = req.body;
    try {
        // Logic to save or update the subscription in the database
        const existingSubscription = await Phone.findOne({ phone, region });
        if (existingSubscription) {
            // Update existing subscription if necessary
            console.log(`Subscription already exists for ${phone} in ${region}`);
        } else {
            // Create a new subscription
            const newPhone = new Phone({ phone, region });
            await newPhone.save();
            // Send confirmation phone
            console.log(`New subscription created for ${phone} in ${region}`);
        }
        res.status(200).send('Subscription successful');
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).send('Error processing subscription');
    }
});



router.get('/nodemailer', async (req, res) => {
    
    try {

        GMAIL_PWD = process.env.GMAIL_PWD;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'energyguideforecast@gmail.com',
              pass: GMAIL_PWD
            }
          });
          
        

        const emailSubs = await getAllEmailSubscriptions();

        const regionData = await getLatestRegionsData();
          
        
        console.log("emailSubs", emailSubs)
        // create Email List for each specific Region

        // TenneT
        
        const TennetEmailAdresses = [];
        const HertzEmailAdresses = [];
        const TransnetBWEmailAdresses = [];
        const AmprionEmailAdresses = [];

        emailSubs.forEach((emailSub) => {
            switch (emailSub.region) {
                case "50Hertz":
                    HertzEmailAdresses.push(emailSub.email);
                    break;
                case "TenneT":
                    TennetEmailAdresses.push(emailSub.email);
                    break;
                case "TransnetBW":
                    TransnetBWEmailAdresses.push(emailSub.email);
                    break;
                case "Amprion":
                    AmprionEmailAdresses.push(emailSub.email);
                    break;
            }
        });

        let HertzMailOptions = {
            from: 'energyguideforecast@gmail.com',
            bcc: HertzEmailAdresses.join(),
            subject: regionData.find(function(element) {return element.region === '50Hertz'}).data.message,
            text: extractHours(regionData.find(function(element) {return element.region === '50Hertz'}).data.forecast_result).length === 0 ? "Currently there is no data available for region 50Hertz" : regionData.find(function(element) {return element.region === '50Hertz'}).data.forecast_result
          };
    
        let TenneTMailOptions = {
            from: 'energyguideforecast@gmail.com',
            bcc: TennetEmailAdresses.join(),
            subject: regionData.find(function(element) {return element.region === 'TenneT'}).data.message,
            text: extractHours(regionData.find(function(element) {return element.region === 'TenneT'}).data.forecast_result).length === 0 ? "Currently there is no data available for region TenneT" : regionData.find(function(element) {return element.region === 'TenneT'}).data.forecast_result
        };
    
        let TransnetBWMailOptions = {
            from: 'energyguideforecast@gmail.com',
            bcc: TransnetBWEmailAdresses.join(),
            subject: regionData.find(function(element) {return element.region === 'TransnetBW'}).data.message,
            text: extractHours(regionData.find(function(element) {return element.region === 'TransnetBW'}).data.forecast_result).length === 0 ? "Currently there is no data available for region TransnetBW" : regionData.find(function(element) {return element.region === 'TransnetBW'}).data.forecast_result
          };
    
        let AmpironMailOptions = {
            from: 'energyguideforecast@gmail.com',
            bcc: "",
            subject: regionData.find(function(element) {return element.region === 'Amprion'}).data.message,
            html: `
                <html>
            <head>
                <title>Energy Forecast</title>
            </head>
            <body>
                ${
                    extractHours(regionData.find(function(element) { return element.region === 'Amprion' }).data.forecast_result).length === 0
                    ? "Currently there is no data available for region Amprion"
                    : regionData.find(function(element) { return element.region === 'Amprion' }).data.forecast_result
                }
            </body>
        </html>
            `
        };


            

        const emailOptions = [HertzMailOptions, TenneTMailOptions, TransnetBWMailOptions, AmpironMailOptions];
        
        console.log(emailOptions, "emailOptions")

        const unsubscribeLink = generateUnsubscribeLink(String(emailSubs[1]), "https://cleaner-tomorrow-c93527173767.herokuapp.com/unsubscribe")
        const unsubscribeLink2 = generateUnsubscribeLink(emailSubs[1].email, "https://cleaner-tomorrow-c93527173767.herokuapp.com/unsubscribe")
        console.log(unsubscribeLink)
        console.log(unsubscribeLink2)
        const footerHtml = `
      <footer>
          <p>To stop receiving these emails, you can <a href="${unsubscribeLink}">Unsubscribe here</a>.</p>
      </footer>
  `;
        
        // transporter.sendMail({...AmpironMailOptions, html: AmpironMailOptions.html += footerHtml}, function(error, info){
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log('Email sent: ' + info.response);
        //     }
        //     });
            
            


        res.status(200).json(body= {"message": "Emails send successfully!"});

        
    } catch (error) {
        console.log(error)
    }

});


module.exports = router;


