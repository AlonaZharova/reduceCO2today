

export function initializeChart(chartData) {
    const ctx = document.getElementById('forecastChart').getContext('2d');

    // calculate shaded boxes
    let annotation_data = {}


    ////////////////////////////////////////////////////////////////////////////////////
    class ForecastData {
        constructor(labels, vals) {
            this.labels = labels;
            this.vals = vals;
        }
    }

    // Function to fetch forecast data from the API
    async function fetchForecastData() {
        const forecast_url = "https://api.electricitymap.org/v3/carbon-intensity/forecast";
        const HEADERS = {
            "auth-token": "1goObmOnxYGNmbjlJ69k"
        };
        const forecast_params = {
            lon: "13.40495400",
            lat: "52.52000660",
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

            console.log("forecast data in json is: ", chartData);

            return chartData;

        } catch (error) {
            console.error("Error fetching forecast data:", error);
        }
    }
    
    // Call the function to fetch and display the chart
    // fetchForecastData();
    
    console.log("Chart data for Yash", fetchForecastData())

    ////////////////////////////////////////////////////////////////////////////////////


    if(chartData.time_frames[0].start < chartData.time_frames[0].end) {

        annotation_data[`shadedRegionGood${0}`] = {
            type: 'box',
            xMin: chartData.time_frames[0].start,
            xMax: chartData.time_frames[0].end,
            backgroundColor: 'rgba(72, 236, 89, 0.25)'
        }

    } else {

        annotation_data[`shadedRegionGood${0}`] = {
            type: 'box',
            xMin: chartData.time_frames[0].start,
            xMax: 23,
            backgroundColor: 'rgba(72, 236, 89, 0.25)'
        }

        annotation_data[`shadedRegionGood${1}`] = {
            type: 'box',
            xMin: 0,
            xMax: chartData.time_frames[0].end,
            backgroundColor: 'rgba(72, 236, 89, 0.25)'
        }
    }

     
    if(chartData.time_frames[1].start < chartData.time_frames[1].end) {

        annotation_data[`shadedRegionBad${0}`] = {
            type: 'box',
            xMin: chartData.time_frames[1].start,
            xMax: chartData.time_frames[1].end,
            backgroundColor: 'rgba(255, 99, 132, 0.25)'
        }

    } else {

        annotation_data[`shadedRegionBad${0}`] = {
            type: 'box',
            xMin: chartData.time_frames[1].start,
            xMax: 23,
            backgroundColor: 'rgba(255, 99, 132, 0.25)'
        }

        annotation_data[`shadedRegionBad${1}`] = {
            type: 'box',
            xMin: 0,
            xMax: chartData.time_frames[1].end,
            backgroundColor: 'rgba(255, 99, 132, 0.25)'
        }


    }
    
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
            plugins:{
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
                    text: 'Renewable energy generation (MWh)',  // Replace with your Y-axis label
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
}

