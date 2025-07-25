

export function initializeChart(chartData) {
    const ctx = document.getElementById('forecastChart').getContext('2d');

    // calculate shaded boxes
    let annotation_data = {}



    if (chartData.time_frames[0].start < chartData.time_frames[0].end) {

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


    if (chartData.time_frames[1].start < chartData.time_frames[1].end) {

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

    // Add vertical line to mark current time (now)
    const now = new Date();
    const currentHour = now.getHours();
    
    annotation_data['currentTimeLine'] = {
        type: 'line',
        xMin: currentHour,
        xMax: currentHour,
        borderColor: 'rgba(245, 245, 242, 0.8)', // Yellow line
        borderWidth: 2,
        borderDash: [5, 5] // Dashed line
    };

    console.log("Chart data values", chartData.vals)

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
            // responsive: true,
            maintainAspectRatio: isDesktop,
            layout: {
                // padding: {
                //     top: 20,   // ← add space above chart title/line
                //     left: 50   // ← if you also want to ensure Y-label is visible
                // }
            },
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
                        text: 'Renewable energy genration (MWh)',  // Replace with your Y-axis label
                        color: 'white',
                        font: {
                            size: isDesktop ? 16 : 10,
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
                            size: isDesktop ? 16 : 10,
                        }
                    }
                }

            }
        }
    });
}

