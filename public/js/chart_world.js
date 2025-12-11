/**
 * Finds green (low carbon) and red (high carbon) bands on a per-day basis using absolute values.
 * Uses a sliding 3-hour window to find the actual best and worst periods each day.
 * 
 * GREEN BANDS: 3-hour window with the LOWEST average carbon intensity
 * RED BANDS: 3-hour window with the HIGHEST average carbon intensity
 * 
 * This guarantees bands cover the actual extremes (not just statistical outliers).
 * Each day gets exactly one green band and one red band (if enough hours available).
 * 
 * @param {Array} forecastData - Array of objects: { datetime: ISO string, carbonIntensity: number }
 * @returns {Object} { 
 *   greenBands: Array<{start: string, end: string, day: string, avgIntensity: number}>, 
 *   redBands: Array<{start: string, end: string, day: string, avgIntensity: number}>,
 *   dayStats: Array<{day: string, avgIntensity: number, minIntensity: number, maxIntensity: number, date: Date}>
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
        
        // Calculate statistics for this day
        const intensities = dayData.map(d => d.carbonIntensity);
        const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        const minIntensity = Math.min(...intensities);
        const maxIntensity = Math.max(...intensities);

        console.log(`Day average: ${mean.toFixed(1)} gCO2/kWh`);
        console.log(`Day range: ${minIntensity} - ${maxIntensity} gCO2/kWh`);

        // Store day statistics for context
        dayStats.push({
            day: dayKey,
            avgIntensity: Math.round(mean),
            minIntensity: Math.round(minIntensity),
            maxIntensity: Math.round(maxIntensity),
            date: new Date(dayData[0].datetime)
        });

        // Add global index to each data point for chart positioning
        const labeled = dayData.map(d => ({
            ...d,
            idx: forecastData.indexOf(d)
        }));

        // Helper function: Find best consecutive 3-hour window
        // Uses a sliding window approach to find the optimal period
        function findBestWindow(arr, windowSize, compareFn) {
            if (arr.length < windowSize) {
                console.log(`Not enough hours (${arr.length}) for ${windowSize}-hour window`);
                return null;
            }
            
            let bestWindow = null;
            let bestAvg = null;
            
            // Slide the window across all possible positions
            for (let i = 0; i <= arr.length - windowSize; i++) {
                const window = arr.slice(i, i + windowSize);
                const avgIntensity = window.reduce((sum, item) => sum + item.carbonIntensity, 0) / windowSize;
                
                // Check if this window is better than current best
                if (bestAvg === null || compareFn(avgIntensity, bestAvg)) {
                    bestAvg = avgIntensity;
                    bestWindow = window;
                }
            }
            
            return bestWindow;
        }

        // Find GREEN BAND: 3-hour window with LOWEST average carbon intensity
        const greenWindow = findBestWindow(labeled, 3, (current, best) => current < best);
        
        if (greenWindow) {
            const greenBand = {
                start: greenWindow[0].datetime,
                end: greenWindow[greenWindow.length - 1].datetime,
                day: dayKey,
                avgIntensity: Math.round(greenWindow.reduce((sum, item) => sum + item.carbonIntensity, 0) / greenWindow.length)
            };
            allGreenBands.push(greenBand);
            console.log(`✓ Green band: ${greenBand.start} to ${greenBand.end} (Avg: ${greenBand.avgIntensity} gCO2/kWh)`);
        }

        // Find RED BAND: 3-hour window with HIGHEST average carbon intensity
        const redWindow = findBestWindow(labeled, 3, (current, best) => current > best);
        
        if (redWindow) {
            const redBand = {
                start: redWindow[0].datetime,
                end: redWindow[redWindow.length - 1].datetime,
                day: dayKey,
                avgIntensity: Math.round(redWindow.reduce((sum, item) => sum + item.carbonIntensity, 0) / redWindow.length)
            };
            allRedBands.push(redBand);
            console.log(`✓ Red band: ${redBand.start} to ${redBand.end} (Avg: ${redBand.avgIntensity} gCO2/kWh)`);
        }
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
            console.log(`Looking for datetime: ${datetime}, found at index: ${index}`);
            return index;
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
