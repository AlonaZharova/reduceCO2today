/**
 * Find exactly one band (green or red) within a 24-hour period.
 * Always returns a band - guaranteed to find one.
 * 
 * @param {Array} dayData - List of forecast data for a single day with z-scores
 * @param {boolean} isGreen - If true, find green band (lowest z-scores), else find red band (highest z-scores)
 * @returns {Object|null} Band with start and end times (always returns a band)
 */
function findBestBandInDay(dayData, isGreen = true) {
    if (!dayData || dayData.length < 3) {
        // If less than 3 hours of data, return the entire period as the band
        if (dayData && dayData.length > 0) {
            return {
                start: dayData[0].datetime,
                end: dayData[dayData.length - 1].datetime
            };
        }
        return null;
    }

    // Sort by z-score: ascending for green (lowest carbon), descending for red (highest carbon)
    const sortedData = [...dayData].sort((a, b) => isGreen ? a.z - b.z : b.z - a.z);

    /**
     * Find consecutive bands from candidates sorted by index.
     */
    function findConsecutiveBand(candidates, minLength = 3) {
        const candidatesByIdx = [...candidates].sort((a, b) => a.idx - b.idx);
        
        const bands = [];
        let currentBand = [];
        
        for (const d of candidatesByIdx) {
            if (currentBand.length === 0) {
                currentBand.push(d);
            } else if (d.idx === currentBand[currentBand.length - 1].idx + 1) {
                currentBand.push(d);
            } else {
                if (currentBand.length >= minLength) {
                    bands.push(currentBand);
                }
                currentBand = [d];
            }
        }
        
        if (currentBand.length >= minLength) {
            bands.push(currentBand);
        }
        
        return bands;
    }

    // Try progressively larger candidate pools until we find a valid band
    for (const poolSize of [6, 12, 18, dayData.length]) {
        const candidates = sortedData.slice(0, Math.min(poolSize, sortedData.length));
        const bands = findConsecutiveBand(candidates, 3);
        
        if (bands.length > 0) {
            // Select the best band (lowest average z for green, highest for red)
            let bestBand = null;
            let bestScore = isGreen ? Infinity : -Infinity;
            
            for (const band of bands) {
                const avgZ = band.reduce((sum, d) => sum + d.z, 0) / band.length;
                if (isGreen && avgZ < bestScore) {
                    bestScore = avgZ;
                    bestBand = band;
                } else if (!isGreen && avgZ > bestScore) {
                    bestScore = avgZ;
                    bestBand = band;
                }
            }
            
            if (bestBand) {
                return {
                    start: bestBand[0].datetime,
                    end: bestBand[bestBand.length - 1].datetime
                };
            }
        }
    }

    // Fallback: if still no band found, take the best 3 consecutive hours by score
    // Find all possible 3-hour windows and pick the best one
    const dayByIdx = [...dayData].sort((a, b) => a.idx - b.idx);
    let bestWindow = null;
    let bestScore = isGreen ? Infinity : -Infinity;
    
    for (let i = 0; i < dayByIdx.length - 2; i++) {
        // Check if these 3 hours are consecutive
        if (dayByIdx[i + 1].idx === dayByIdx[i].idx + 1 && 
            dayByIdx[i + 2].idx === dayByIdx[i + 1].idx + 1) {
            const window = [dayByIdx[i], dayByIdx[i + 1], dayByIdx[i + 2]];
            const avgZ = window.reduce((sum, d) => sum + d.z, 0) / 3;
            
            if (isGreen && avgZ < bestScore) {
                bestScore = avgZ;
                bestWindow = window;
            } else if (!isGreen && avgZ > bestScore) {
                bestScore = avgZ;
                bestWindow = window;
            }
        }
    }
    
    if (bestWindow) {
        return {
            start: bestWindow[0].datetime,
            end: bestWindow[bestWindow.length - 1].datetime
        };
    }
    
    // Ultimate fallback: just return the first/last 3 hours based on type
    const bestThree = sortedData.slice(0, 3);
    const bestThreeByIdx = [...bestThree].sort((a, b) => a.idx - b.idx);
    
    return {
        start: bestThreeByIdx[0].datetime,
        end: bestThreeByIdx[bestThreeByIdx.length - 1].datetime
    };
}

/**
 * Find green and red carbon bands based on carbon intensity z-scores.
 * For 72-hour forecasts, calculates one green and one red band per 24-hour period.
 * Groups by the timestamp's own timezone (preserves the offset from the data).
 * 
 * @param {Array} forecastData - List of forecast data with carbonIntensity values
 * @returns {Object} Dictionary with greenBands and redBands (one per day for multi-day forecasts)
 */
function findCarbonBands(forecastData) {
    if (!forecastData || forecastData.length === 0) {
        return { greenBands: [], redBands: [] };
    }

    // Parse datetime strings and group by day using the timestamp's own timezone
    const days = {};
    for (let i = 0; i < forecastData.length; i++) {
        const d = forecastData[i];
        const dtStr = d.datetime || '';
        
        let dayKey;
        try {
            // Parse ISO format datetime while preserving the original timezone
            // Extract date part from ISO string to preserve timezone
            if (dtStr.includes('T')) {
                // Extract date part (YYYY-MM-DD) from ISO string
                // This preserves the date in the original timezone context
                const dateMatch = dtStr.match(/^(\d{4}-\d{2}-\d{2})/);
                if (dateMatch) {
                    dayKey = dateMatch[1];
                } else {
                    // Fallback: parse as Date and extract date components
                    const dt = new Date(dtStr);
                    dayKey = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
                }
            } else {
                // Non-ISO format, try to parse
                const dt = new Date(dtStr);
                dayKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
            }
        } catch (e) {
            // Fallback: group by index (24 hours per day)
            dayKey = `day_${Math.floor(i / 24)}`;
        }
        
        if (!days[dayKey]) {
            days[dayKey] = [];
        }
        days[dayKey].push({ ...d, globalIdx: i });
    }

    const greenBands = [];
    const redBands = [];
    
    // Process each day separately
    const sortedDayKeys = Object.keys(days).sort();
    for (const dayKey of sortedDayKeys) {
        const dayData = days[dayKey];
        
        if (dayData.length < 3) {
            continue;
        }
        
        // Calculate mean and standard deviation for this day
        const intensities = dayData.map(d => d.carbonIntensity);
        const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        const variance = intensities.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / intensities.length;
        const std = Math.sqrt(variance) || 1; // Avoid division by zero
        
        // Create labeled data with z-scores for this day
        const labeledDay = dayData.map((d, i) => ({
            ...d,
            z: (d.carbonIntensity - mean) / std,
            idx: i // Local index within the day
        }));
        
        // Find one green band and one red band for this day
        const greenBand = findBestBandInDay(labeledDay, true);
        const redBand = findBestBandInDay(labeledDay, false);
        
        if (greenBand) {
            greenBands.push(greenBand);
        }
        if (redBand) {
            redBands.push(redBand);
        }
    }
    
    return {
        greenBands: greenBands,
        redBands: redBands
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

        const { greenBands, redBands } = findCarbonBands(forecastDataArr);
        console.log("Green time zones:", greenBands);
        console.log("Red time zones:", redBands);

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

        // Helper function to check if two bands overlap
        function bandsOverlap(band1, band2) {
            const start1 = new Date(band1.start).getTime();
            const end1 = new Date(band1.end).getTime();
            const start2 = new Date(band2.start).getTime();
            const end2 = new Date(band2.end).getTime();
            return !(end1 <= start2 || end2 <= start1);
        }

        let annotation_data = {};

        // Render green bands first
        greenBands.forEach((band, idx) => {
            annotation_data[`shadedRegionGood${idx}`] = {
                type: 'box',
                xMin: labelToIndex(band.start),
                xMax: labelToIndex(band.end),
                backgroundColor: 'rgba(72, 236, 89, 0.25)',
                borderWidth: 0
            };
        });

        // Render red bands, but check for overlaps and adjust opacity/color if needed
        redBands.forEach((band, idx) => {
            // Check if this red band overlaps with any green band
            const overlapsGreen = greenBands.some(greenBand => bandsOverlap(band, greenBand));
            
            // If overlapping, use a darker red or adjust rendering to avoid yellow blend
            const bgColor = overlapsGreen 
                ? 'rgba(200, 50, 80, 0.3)' // Slightly darker red when overlapping
                : 'rgba(255, 99, 132, 0.25)'; // Normal red
            
            annotation_data[`shadedRegionBad${idx}`] = {
                type: 'box',
                xMin: labelToIndex(band.start),
                xMax: labelToIndex(band.end),
                backgroundColor: bgColor,
                borderWidth: 0
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
            const dayLabel = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
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
