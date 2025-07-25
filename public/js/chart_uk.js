function findCarbonBands(forecastData) {
    const intensities = forecastData.map(d => d.carbonIntensity);
    const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const std = Math.sqrt(intensities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intensities.length);

    const labeled = forecastData.map((d, i) => ({
        ...d,
        z: (d.carbonIntensity - mean) / std,
        idx: i
    }));

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

    const greenBands = findBands(labeled, d => d.z <= -1);
    const redBands = findBands(labeled, d => d.z >= 1);

    return { greenBands, redBands };
}

export function initializeUKChart(regionId) {
    const ctx = document.getElementById('forecastChart').getContext('2d');

    class ForecastData {
        constructor(labels, vals, time_frames, rawDates) {
            this.labels = labels;
            this.vals = vals;
            this.time_frames = time_frames;
            this.rawDates = rawDates;
        }
    }

    async function fetchUKForecastData(regionId) {
        // UK National Grid Carbon Intensity API for regional data
        const now = new Date();
        const fromDate = now.toISOString().split('.')[0] + 'Z'; // Format: YYYY-MM-DDTHH:mm:ssZ

        const forecast_url = `https://api.carbonintensity.org.uk/regional/intensity/${fromDate}/fw48h/regionid/${regionId}`;

        // UK regions mapping
        // do not change the order of the regions
        const ukRegions = [
            "North Scotland",
            "South Scotland",
            "North West England",
            "North East England",
            "Yorkshire",
            "North Wales & Merseyside",
            "South Wales",
            "West Midlands",
            "East Midlands",
            "East England",
            "South West England",
            "South England",
            "London",
            "South East England",
        ];

        const regionName = ukRegions[regionId - 1];
        if (!regionName) {
            throw new Error(`Invalid region ID: ${regionId}`);
        }

        try {
            // Fetch data for the specific UK region
            console.log(forecast_url);
            const response = await fetch(forecast_url, {
                
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API error ${response.status}: ${response.statusText}`);
            }

            const json = await response.json();
            const data = json.data.data;

            console.log(data);

            const rawDates = data.map(item => item.from);
            const labels = data.map(item => {
                const date = new Date(item.from);
                return `${String(date.getHours()).padStart(2, '0')}:00`;
            });
            const vals = data.map(item => item.intensity.forecast);

            return new ForecastData(labels, vals, [], rawDates);
        } catch (error) {
            console.error("Error fetching UK forecast data:", error);
            const msgBox = document.getElementById("chartMessage");
            if (msgBox) {
                msgBox.innerHTML = "🇬🇧 Forecast data isn't available for this UK region yet.";
            }
            return null;
        }
    }

    fetchUKForecastData(regionId).then(chartData => {
        if (!chartData) return;

        const forecastDataArr = chartData.rawDates.map((datetime, i) => ({
            datetime,
            carbonIntensity: chartData.vals[i]
        }));

        const { greenBands, redBands } = findCarbonBands(forecastDataArr);

        function labelToIndex(datetime) {
            return chartData.rawDates.indexOf(datetime);
        }

        let annotation_data = {};

        greenBands.forEach((band, idx) => {
            annotation_data[`shadedRegionGood${idx}`] = {
                type: 'box',
                xMin: labelToIndex(band.start),
                xMax: labelToIndex(band.end),
                backgroundColor: 'rgba(72, 236, 89, 0.25)'
            };
        });

        redBands.forEach((band, idx) => {
            annotation_data[`shadedRegionBad${idx}`] = {
                type: 'box',
                xMin: labelToIndex(band.start),
                xMax: labelToIndex(band.end),
                backgroundColor: 'rgba(255, 99, 132, 0.25)'
            };
        });

        const dayChangeIndices = [];
        let previousDay = null;

        chartData.rawDates.forEach((raw, i) => {
            const date = new Date(raw);
            const currentDay = date.getDate();
            if (previousDay !== null && currentDay !== previousDay) {
                dayChangeIndices.push(i);
            }
            previousDay = currentDay;
        });

        console.log('Day change indices:', dayChangeIndices);
        console.log('Raw dates:', chartData.rawDates);

        if (dayChangeIndices.length > 0) {
            // Add label before the first vertical line (at index 0)
            const firstIndex = 0;
            const firstDate = new Date(chartData.rawDates[firstIndex]);
            const firstLabel = `${firstDate.getDate()} ${firstDate.toLocaleString('en-GB', { month: 'short' })}`;
            console.log('First day label:', firstLabel);
            annotation_data[`dayStartLabel`] = {
                type: 'line',
                xMin: firstIndex,
                xMax: firstIndex,
                borderColor: 'white',
                borderWidth: 0,
                label: {
                    content: firstLabel,
                    enabled: true,
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    position: 'end',
                    xAdjust: -30,
                    yAdjust: 35,
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            };
        }

        dayChangeIndices.forEach((idx, i) => {
            const date = new Date(chartData.rawDates[idx]);
            const dayLabel = `${date.getDate()} ${date.toLocaleString('en-GB', { month: 'short' })}`;
            console.log('Creating day separator for:', dayLabel, 'at index:', idx);
            annotation_data[`daySeparator${i}`] = {
                type: 'line',
                xMin: idx,
                xMax: idx,
                borderColor: 'white',
                borderWidth: 2,
                borderDash: [4, 4],
                label: {
                    content: dayLabel,
                    enabled: true,
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    position: 'end',
                    yAdjust: 35,
                    xAdjust: 30,
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            };
        });

        console.log('Final annotation data:', annotation_data);

        const isDesktop = window.innerWidth >= 768;

        const forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'UK Carbon Intensity Forecast',
                    data: chartData.vals,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 4
                }]
            },
            options: {
                maintainAspectRatio: isDesktop,
                plugins: {
                    legend: {
                        labels: {
                            color: "white"
                        }
                    },
                    annotation: {
                        common: {
                            drawTime: 'afterDraw'
                        },
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
                            text: 'Carbon intensity (gCO2eq/kWh)',
                            color: 'white',
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        type: 'category',
                        grid: {
                            color: 'grey'
                        },
                        ticks: {
                            color: 'white',
                            padding: 17
                        },
                        title: {
                            display: true,
                            text: 'Time (UK)',
                            color: 'white',
                            font: {
                                size: 16
                            },
                            padding: {
                                top: -12
                            }
                        }
                    }
                }
            }
        });
    });
} 