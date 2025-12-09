/**
 * Finds green (low carbon) and red (high carbon) bands on a per-day basis.
 * Each day's bands are calculated using that day's statistics for practical daily planning.
 * 
 * @param {Array} forecastData - Array of objects: { datetime: ISO string, carbonIntensity: number }
 * @returns {Object} { 
 *   greenBands: Array<{start: string, end: string, day: string}>, 
 *   redBands: Array<{start: string, end: string, day: string}>,
 *   dayStats: Array<{day: string, avgIntensity: number, minIntensity: number, maxIntensity: number}>
 * }
 */
function findCarbonBands(forecastData) {
    // Group data by day
    const dayGroups = {};
    
    forecastData.forEach(d => {
        const date = new Date(d.datetime);
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        if (!dayGroups[dayKey]) {
            dayGroups[dayKey] = [];
        }
        dayGroups[dayKey].push(d);
    });

    const allGreenBands = [];
    const allRedBands = [];
    const dayStats = [];

    // Process each day independently
    Object.keys(dayGroups).forEach(dayKey => {
        const dayData = dayGroups[dayKey];

        console.log(`\n=== Processing ${dayKey} ===`);
        console.log(`Hours in this day: ${dayData.length}`);
        
        // Calculate statistics for this day only
        const intensities = dayData.map(d => d.carbonIntensity);
        const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        const std = Math.sqrt(intensities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intensities.length);
        const minIntensity = Math.min(...intensities);
        const maxIntensity = Math.max(...intensities);

        console.log(`Day mean: ${mean.toFixed(1)}, Day std: ${std.toFixed(1)}`);
        console.log(`Day range: ${minIntensity} - ${maxIntensity}`);

        // Store day statistics for context
        dayStats.push({
            day: dayKey,
            avgIntensity: Math.round(mean),
            minIntensity: Math.round(minIntensity),
            maxIntensity: Math.round(maxIntensity),
            date: new Date(dayData[0].datetime)
        });

        // Label each hour with z-score and index
        const labeled = dayData.map((d, i) => ({
            ...d,
            z: (d.carbonIntensity - mean) / std,
            idx: forecastData.indexOf(d) // Global index in original array
        }));

        // Find consecutive bands within this day
        function findBands(arr, predicate) {
            const bands = [];
            let band = [];
            
            for (let i = 0; i < arr.length; i++) {
                if (predicate(arr[i])) {
                    if (band.length === 0 || arr[i].idx === band[band.length - 1].idx + 1) {
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
                end: b[b.length - 1].datetime,
                day: dayKey,
                avgIntensity: Math.round(b.reduce((sum, item) => sum + item.carbonIntensity, 0) / b.length)
            }));
        }

        // Find green and red bands for this day
        const dayGreenBands = findBands(labeled, d => d.z <= -1);
        const dayRedBands = findBands(labeled, d => d.z >= 1);

        allGreenBands.push(...dayGreenBands);
        allRedBands.push(...dayRedBands);
    });

    return { 
        greenBands: allGreenBands, 
        redBands: allRedBands,
        dayStats: dayStats.sort((a, b) => a.date - b.date)
    };
}

export function initializeChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');

    class ForecastData {
        constructor(labels, vals, time_frames, rawDates) {
            this.labels = labels;
            this.vals = vals;
            this.time_frames = time_frames;
            this.rawDates = rawDates;
        }
    }

    async function fetchForecastData() {

        const params = new URLSearchParams(window.location.search);
        const lat = params.get('lat');
        const lng = params.get('lng');
        const countryCode = params.get('countryCode');

        let url;
        if (lat && lng) {
            // Use coordinates if available
            url = `/api/carbon-forecast?lat=${lat}&lon=${lng}&horizonHours=72`;
        } else if (countryCode) {
            // Use country code as fallback
            url = `/api/carbon-forecast?zone=${countryCode}&horizonHours=72`;
        } else {
            console.error('No coordinates or country code provided');
            return;
        }

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error ${response.status}: ${response.statusText}`);
            }

            const json = await response.json();
            const data = json.forecast;

            const rawDates = data.map(item => item.datetime);
            const labels = data.map(item => {
                const date = new Date(item.datetime);
                return `${String(date.getHours()).padStart(2, '0')}:00`;
            });
            const vals = data.map(item => item.carbonIntensity);

            return new ForecastData(labels, vals, [], rawDates);
        } catch (error) {
            console.error("Error fetching forecast data:", error);
            const msgBox = document.getElementById("chartMessage");
            if (msgBox) {
                msgBox.innerHTML = "🌍 Forecast data isn't available for your location yet.";
            }
            return null;
        }
    }

    fetchForecastData().then(chartData => {
        if (!chartData) return;

        const forecastDataArr = chartData.rawDates.map((datetime, i) => ({
            datetime,
            carbonIntensity: chartData.vals[i]
        }));

        const { greenBands, redBands, dayStats } = findCarbonBands(forecastDataArr);

        console.log("Green time zones:", greenBands);
        console.log("Red time zones:", redBands);
        console.log("Day statistics:", dayStats);

        // Display day quality context (can be shown in UI or console)
        dayStats.forEach(stat => {
            const date = stat.date;
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            console.log(`${dayLabel}: Avg ${stat.avgIntensity} gCO2/kWh (Range: ${stat.minIntensity}-${stat.maxIntensity})`);
        });

        // Expose green and red time zones in hidden HTML containers
        const greenTimeContainer = document.getElementById("greenTimeZones");
        const redTimeContainer = document.getElementById("redTimeZones");

        if (greenTimeContainer) {
            greenTimeContainer.innerHTML = ""; // Clear previous content
            greenBands.forEach(band => {
                const div = document.createElement("div");
                div.textContent = `Start: ${band.start}, End: ${band.end}`;
                greenTimeContainer.appendChild(div);
            });
        }

        if (redTimeContainer) {
            redTimeContainer.innerHTML = ""; // Clear previous content
            redBands.forEach(band => {
                const div = document.createElement("div");
                div.textContent = `Start: ${band.start}, End: ${band.end}`;
                redTimeContainer.appendChild(div);
            });
        }

        function labelToIndex(datetime) {
            const index = chartData.rawDates.indexOf(datetime);
            return index >= 0 ? index - 2 : index; // Yash (18/08/25): I am not aware of the reason but I need to offset he index by -2 to ensure that the plot is in sync with the forecast and calculated start and end time of green and red bands. The root cause is still unknown and needs to be addressed. The possible reason: the forecast array starts 2h before the current hour, whereas the plot starts it's labels from the current hour.
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

        if (dayChangeIndices.length > 0) {
            // Add label before the first vertical line (at index 0)
            const firstIndex = 0;
            const firstDate = new Date(chartData.rawDates[firstIndex]);
            const firstLabel = `${firstDate.getDate()} ${firstDate.toLocaleString('en-US', { month: 'short' })}`;
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
                    // backgrpound color transparent
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    position: 'end',
                    xAdjust: -30,
                    // yMax: 'chartArea.bottom',
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
            const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayStat = dayStats.find(s => s.day === dayKey);
            
            const dayLabel = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
            const qualityLabel = dayStat ? `\n(Avg: ${dayStat.avgIntensity})` : '';
            
            annotation_data[`daySeparator${i}`] = {
                type: 'line',
                xMin: idx,
                xMax: idx,
                borderColor: 'white',
                borderWidth: 2,
                borderDash: [4, 4],
                label: {
                    content: dayLabel + qualityLabel,
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

        const isDesktop = window.innerWidth >= 768;

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
                maintainAspectRatio: isDesktop,
                plugins: {
                    legend: {
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
                            text: 'Carbon intensity (gCO2eq/kWh)',
                            color: 'white',
                            font: {
                                size: 12,
                                //padding: 20  // Added padding to create more space
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
                            text: 'Time',
                            color: 'white',
                            font: {
                                size: 16
                            },
                            padding: {
                                top: -12  // Added padding to create more space between axis and title
                            }
                        }
                    }
                }
            }
        });
    });
}
