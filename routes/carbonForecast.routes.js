const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
    const { lat, lon, zone, horizonHours } = req.query;
    
    // Check if we have either lat/lon or zone
    if (!lat && !lon && !zone) {
        return res.status(400).json({ error: "Either lat/lon or zone is required" });
    }
    
    try {
        let params = { horizonHours: horizonHours || 72 };
        
        // Use zone if provided, otherwise use lat/lon
        if (zone) {
            params.zone = zone;
        } else {
            params.lat = lat;
            params.lon = lon;
        }
        
        const response = await axios.get(
            "https://api.electricitymap.org/v3/carbon-intensity/forecast",
            {
                params: params,
                headers: { "auth-token": process.env.ELECTRICITYMAP_TOKEN }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch forecast data" });
    }
});

// Route to manually trigger world data fetch (for testing)
router.post("/fetch-world-data", async (req, res) => {
    try {
        const { fetchAndSaveWorldData } = require('../controllers/world-cron-job');
        const { worldZones } = require('../controllers/world-cron-job');
        
        // Only fetch first 5 zones for testing to avoid overwhelming the API
        const testZones = worldZones.slice(0, 5);
        
        await fetchAndSaveWorldData(testZones);
        res.json({ 
            message: "World data fetch completed successfully", 
            zonesProcessed: testZones.length 
        });
    } catch (error) {
        console.error("Error in manual world data fetch:", error);
        res.status(500).json({ error: "Failed to fetch world data" });
    }
});

module.exports = router;