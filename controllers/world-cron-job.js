const cron = require('node-cron');
const axios = require("axios");
const WorldData = require('../models/WorldData');

// Define an array of world zones
const worldZones = [
    "AE", "AF", "AG", "AL", "AM", "AO", "AR", "AT", "AU", "AU-NSW", "AU-NT", "AU-QLD", "AU-SA", "AU-TAS", "AU-TAS-FI", "AU-TAS-KI", "AU-VIC", "AU-WA", "AU-WA-RI", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BN", "BO", "BR", "BR-CS", "BR-N", "BR-NE", "BR-S", "BS", "BT", "BW", "BY", "BZ", "CA", "CA-AB", "CA-BC", "CA-MB", "CA-NB", "CA-NL", "CA-NS", "CA-NT", "CA-NU", "CA-ON", "CA-PE", "CA-QC", "CA-SK", "CA-YT", "CD", "CF", "CG", "CH", "CI", "CL-SEN", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DK-BHM", "DK-DK1", "DK-DK2", "DM", "DO", "DZ", "EC", "EE", "EG", "ER", "ES", "ES-CE", "ES-CN-FV", "ES-CN-GC", "ES-CN-HI", "ES-CN-IG", "ES-CN-LP", "ES-CN-LZ", "ES-CN-TE", "ES-IB-FO", "ES-IB-IZ", "ES-IB-MA", "ES-IB-ME", "ES-ML", "ET", "FI", "FJ", "FK", "FM", "FO", "FO-MI", "FO-SI", "FR", "FR-COR", "GA", "GB", "GB-NIR", "GB-ORK", "GE", "GF", "GH", "GI", "GL", "GL", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IN", "IN-EA", "IN-NE", "IN-NO", "IN-SO", "IN-WE", "IQ", "IR", "IS", "IT", "IT-CNO", "IT-CSO", "IT-NO", "IT-SAR", "IT-SIC", "IT-SO", "JM", "JO", "JP", "JP-CB", "JP-CG", "JP-HKD", "JP-HR", "JP-KN", "JP-KY", "JP-ON", "JP-SK", "JP-TH", "JP-TK", "KE", "KG", "KH", "KM", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MD", "ME", "MG", "MK", "ML", "MM", "MN", "MO", "MQ", "MR", "MT", "MU", "MV", "MW", "MX", "MY", "MY-EM", "MY-WM", "MZ", "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NO-NO1", "NO-NO2", "NO-NO3", "NO-NO4", "NO-NO5", "NP", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PH-LU", "PH-MI", "PH-VI", "PK", "PL", "PM", "PR", "PS", "PT", "PT-MA", "PW", "PY", "QA", "RE", "RO", "RS", "RU-1", "RU-2", "RU-AS", "RW", "SA", "SB", "SC", "SD", "SE", "SE-SE1", "SE-SE2", "SE-SE3", "SE-SE4", "SG", "SI", "SK", "SL", "SN", "SO", "SR", "SS", "SV", "SY", "SZ", "TD", "TG", "TH", "TJ", "TL", "TM", "TN", "TO", "TR", "TT", "TW", "TZ", "UG", "US", "US-AK", "US-AK-SEAPA", "US-CAL-BANC", "US-CAL-CISO", "US-CAL-IID", "US-CAL-LDWP", "US-CAL-TIDC", "US-CAR-CPLE", "US-CAR-CPLW", "US-CAR-DUK", "US-CAR-SC", "US-CAR-SCEG", "US-CAR-YAD", "US-CENT-SPA", "US-CENT-SWPP", "US-FLA-FMPP", "US-FLA-FPC", "US-FLA-FPL", "US-FLA-GVL", "US-FLA-HST", "US-FLA-JEA", "US-FLA-SEC", "US-FLA-TAL", "US-FLA-TEC", "US-MIDA-PJM", "US-MIDW-AECI", "US-MIDW-LGEE", "US-MIDW-MISO", "US-NE-ISNE", "US-NW-AVA", "US-NW-BPAT", "US-NW-CHPD", "US-NW-DOPD", "US-NW-GCPD", "US-NW-GRID", "US-NW-IPCO", "US-NW-NEVP", "US-NW-NWMT", "US-NW-PACE", "US-NW-PACW", "US-NW-PGE", "US-NW-PSCO", "US-NW-PSEI", "US-NW-SCL", "US-NW-TPWR", "US-NW-WACM", "US-NW-WAUW", "US-NY-NYIS", "US-SE-SEPA", "US-SE-SOCO", "US-SW-AZPS", "US-SW-EPE", "US-SW-PNM", "US-SW-SRP", "US-SW-TEPC", "US-SW-WALC", "US-TEN-TVA", "US-TEX-ERCO", "UY", "UZ", "VC", "VE", "VI", "VN", "VU", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW"
];

async function fetchAndSaveWorldData(zones) {
    console.log("Fetching and saving data for world zones:", zones.length, "zones");
    try {
        for (const zone of zones) {
            try {
                const url = "https://api.electricitymap.org/v3/carbon-intensity/forecast";
                const response = await axios.get(url, {
                    params: { 
                        zone: zone, 
                        horizonHours: 72 
                    },
                    headers: { 
                        "auth-token": process.env.ELECTRICITYMAP_TOKEN 
                    }
                });

                // Only save if we have forecast data
                if (response.data && response.data.forecast && response.data.forecast.length > 0) {
                    const newData = new WorldData({ 
                        zone: zone, 
                        data: response.data 
                    });
                    await newData.save();
                    console.log("Data saved successfully for zone:", zone);
                } else {
                    console.log("No forecast data available for zone:", zone);
                }

                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`Error fetching data for zone ${zone}:`, error.message);
                // Continue with next zone even if one fails
                continue;
            }
        }
        console.log("World data fetching and saving completed for all zones.");
    } catch (error) {
        console.error("Error in fetchAndSaveWorldData:", error);
        throw error;
    }
}

async function getLatestWorldData(zone) {
    try {
        const latestData = await WorldData.findOne({ zone }).sort({
            createdAt: -1,
        });
        return latestData;
    } catch (error) {
        console.error("Error getting latest world data for zone:", zone, error);
        return null;
    }
}

async function getAllLatestWorldData() {
    try {
        const zonePromises = worldZones.map((zone) => {
            return WorldData.findOne({ zone }).sort({
                createdAt: -1,
            });
        });

        const latestWorldResults = await Promise.all(zonePromises);
        return latestWorldResults.filter(result => result !== null); // Filter out null results
        
    } catch (error) {
        console.error("Error getting all latest world data:", error);
        return [];
    }
}

// Schedule the cron job to run every hour
cron.schedule('20 * * * *', async () => {
    try {
        console.log("Starting world data cron job...");
        const result = await fetchAndSaveWorldData(worldZones);
        console.log("World data cron job completed successfully");
    } catch (error) {
        console.error("World data cron job failed:", error);
    }
});

// Export functions for potential use in other parts of the application
module.exports = {
    fetchAndSaveWorldData,
    getLatestWorldData,
    getAllLatestWorldData,
    worldZones
}; 