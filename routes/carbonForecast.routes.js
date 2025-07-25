const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
    const { lat, lon, horizonHours } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: "lat and lon are required" });
    }
    try {
        const response = await axios.get(
            "https://api.electricitymap.org/v3/carbon-intensity/forecast",
            {
                params: { lat, lon, horizonHours: horizonHours || 72 },
                headers: { "auth-token": process.env.ELECTRICITYMAP_TOKEN }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch forecast data" });
    }
});

module.exports = router;