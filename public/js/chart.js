/**
 * Analyzes a forecast array of carbon intensity values and finds all "good" (low carbon intensity)
 * and "bad" (high carbon intensity) periods as bands of consecutive hours.
 * Each band is a group of at least 3 consecutive hours where the z-score is <= -1 (good) or >= 1 (bad).
 *
 * @param {Array} forecastData - Array of objects: { datetime: string, carbonIntensity: number }
 * @returns {Object} { greenBands: Array<{start: string, end: string}>, redBands: Array<{start: string, end: string}> }
 */
function findCarbonBands(forecastData) {
    // 1. Extract values
    const intensities = forecastData.map(d => d.carbonIntensity);

    // 2. Calculate mean and std deviation
    const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const std = Math.sqrt(intensities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intensities.length);

    // 3. Calculate z-scores and label hours
    const labeled = forecastData.map((d, i) => ({
        ...d,
        z: (d.carbonIntensity - mean) / std,
        idx: i
    }));

    // 4. Find consecutive bands (min 3 hours)
    function findBands(arr, predicate) {
        const bands = [];
        let band = [];
        for (let i = 0; i < arr.length; i++) {
            if (predicate(arr[i])) {
                if (band.length === 0 || arr[i].idx === arr[i - 1]?.idx + 1) {
                    band.push(arr[i]);
                } else {
                    if (band.length >= 3) bands.push(band);
                    band = [arr[i]];
                }
            } else {
                if (band.length >= 3) bands.push(band);
                band = [];
            }
        }
        if (band.length >= 3) bands.push(band);
        return bands.map(b => ({
            start: b[0].datetime,
            end: b[b.length - 1].datetime
        }));
    }

    // 5. Green: z <= -1, Red: z >= 1
    const greenBands = findBands(labeled, d => d.z <= -1);
    const redBands = findBands(labeled, d => d.z >= 1);

    return { greenBands, redBands };
}

export function initializeChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');

    ////////////////////////////////////////////////////////////////////////////////////

    // The section holds the code to fetch the forecast from electricitymaps and returns 
    // it as a class object 'chartData' with attributes labels, vals and time_frames
    class ForecastData {
        constructor(labels, vals, time_frames) {
            this.labels = labels;
            this.vals = vals;
            this.time_frames = [];
        }
    }

    // Function to fetch forecast data from the API
    async function fetchForecastData() {
        const forecast_url = "https://api.electricitymap.org/v3/carbon-intensity/forecast";
        const HEADERS = {
            "auth-token": "1goObmOnxYGNmbjlJ69k"
        };

        const params = new URLSearchParams(window.location.search);
        const lat = params.get('lat');
        const lng = params.get('lng');

        // Now fetch forecast data using these
        console.log("Received coordinates:", lat, lng);
        // console.log("The original chartData:", chartData);

        // const forecast_params = {
        //     lon: "13.40495400",
        //     lat: "52.52000660",
        //     horizonHours: 72
        // };

        const forecast_params = {
            lon: lng,
            lat: lat,
            horizonHours: 72
        };

        // Build query string
        const queryString = new URLSearchParams(forecast_params).toString();
        const url = `${forecast_url}?${queryString}`;

        try {
            const response = await fetch(url, {
                headers: HEADERS
            });
            const data = (await response.json()).forecast;

            // Assuming data is an array of objects with carbonIntensity and datetime
            const labels = data.map(item => {
                const date = new Date(item.datetime);
                // Format: "DD-MM HH"
                return `${date.getDate()}-${date.getMonth() + 1} ${date.getHours()}`;
            });
            const vals = data.map(item => item.carbonIntensity);

            // Create the class object
            const chartData = new ForecastData(labels, vals);

            return chartData;

        } catch (error) {
            console.error("Error fetching forecast data:", error);
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////

    fetchForecastData().then(chartData => {
        console.log("forecast data in json is: ", chartData);

        const forecastDataArr = chartData.labels.map((label, i) => ({
            datetime: label, 
            carbonIntensity: chartData.vals[i]
        }));

        // Find carbon bands
        const {greenBands, redBands} = findCarbonBands(forecastDataArr);

        // Convert band datetimes to indices for chart
        function labelToIndex(label) {
            return chartData.labels.indexOf(label);
        }

        // calculate shaded boxes
        let annotation_data = {}

        // Add green bands
        greenBands.forEach((band, idx) => {
            annotation_data[`shadedRegionGood${idx}`] = {
                type: 'box',
                xMin: labelToIndex(band.start),
                xMax: labelToIndex(band.end),
                backgroundColor: 'rgba(72, 236, 89, 0.25)'
            };
        });

        // Add red bands
        redBands.forEach((band, idx) => {
            annotation_data[`shadedRegionBad${idx}`] = {
                type: 'box',
                xMin: labelToIndex(band.start),
                xMax: labelToIndex(band.end),
                backgroundColor: 'rgba(255, 99, 132, 0.25)'
            };
        });

        console.log(greenBands, redBands);


        // if (chartData.time_frames[0].start < chartData.time_frames[0].end) {

        //     annotation_data[`shadedRegionGood${0}`] = {
        //         type: 'box',
        //         xMin: chartData.time_frames[0].start,
        //         xMax: chartData.time_frames[0].end,
        //         backgroundColor: 'rgba(72, 236, 89, 0.25)'
        //     }

        // } else {

        //     annotation_data[`shadedRegionGood${0}`] = {
        //         type: 'box',
        //         xMin: chartData.time_frames[0].start,
        //         xMax: 23,
        //         backgroundColor: 'rgba(72, 236, 89, 0.25)'
        //     }

        //     annotation_data[`shadedRegionGood${1}`] = {
        //         type: 'box',
        //         xMin: 0,
        //         xMax: chartData.time_frames[0].end,
        //         backgroundColor: 'rgba(72, 236, 89, 0.25)'
        //     }
        // }


        // if (chartData.time_frames[1].start < chartData.time_frames[1].end) {

        //     annotation_data[`shadedRegionBad${0}`] = {
        //         type: 'box',
        //         xMin: chartData.time_frames[1].start,
        //         xMax: chartData.time_frames[1].end,
        //         backgroundColor: 'rgba(255, 99, 132, 0.25)'
        //     }

        // } else {

        //     annotation_data[`shadedRegionBad${0}`] = {
        //         type: 'box',
        //         xMin: chartData.time_frames[1].start,
        //         xMax: 23,
        //         backgroundColor: 'rgba(255, 99, 132, 0.25)'
        //     }

        //     annotation_data[`shadedRegionBad${1}`] = {
        //         type: 'box',
        //         xMin: 0,
        //         xMax: chartData.time_frames[1].end,
        //         backgroundColor: 'rgba(255, 99, 132, 0.25)'
        //     }


        // }

        console.log("Chart data values", chartData.vals)

        const forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Forecast Data',
                    data: chartData.vals,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 4
                }]
            },
            options: {
                plugins: {
                    legend:
                    {
                        labels: {
                            color: "white"
                        }
                    },
                    annotation: {
                        annotations: annotation_data
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "grey"
                        },
                        ticks: {
                            color: "white"
                        },
                        title: {
                            display: true,
                            text: 'Carbon intensity (gCO2eq/kWh)',  // Replace with your Y-axis label
                            color: 'white',
                            font: {
                                size: 16
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: "grey"
                        },
                        ticks: {
                            color: "white"
                        },
                        title: {
                            display: true,
                            text: 'Time',  // Replace with your Y-axis label
                            color: 'white',
                            font: {
                                size: 16
                            }
                        }
                    }

                }
            }
        });
    });
}

