const axios = require("axios");
const express = require("express");

const router = express.Router();
const RegionData = require("../models/RegionData"); // Adjust the path as needed
const Subscription = require("../models/Email");

const regions = ["Amprion", "TenneT", "TransnetBW", "50Hertz"]


router.get("/forecast", async (req, res) => {
    // API endpoint for current Data for all regions
    
    try {
        
        const regionPromises = regions.map((region) => {
            return RegionData.findOne({region}).sort({createdAt: -1})
        })

        const regionData = await Promise.all(regionPromises)

        res.status(200).send({data: regionData})
        
    } catch (error) {
        console.log(error)
        res.status(500).send({"message": error})
    }


});

router.get("/:region", async (req, res) => {

    try {
        
        const region = req.params.region;
        console.log(region)
        let regionData = await RegionData.findOne({region}).sort({createdAt: -1});
        if (regionData == null){
            regionData = "There is no data available for today"

        }
             
        res.status(200).send({"data": regionData})

    } catch (error) {
        res.status(500).send({"message": "Server Error"})
        
    }

});


module.exports = router;