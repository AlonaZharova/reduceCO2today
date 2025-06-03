document.addEventListener("DOMContentLoaded", function () {
  const map = L.map('simple-map').setView([25, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let marker;

  map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    if (marker) map.removeLayer(marker);

    // Reverse geocode the coordinates to get the country or region name
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        const country = data.address.country || "Unknown";
        console.log('Country:', country);

        // ✅ Redirect to new page with coordinates in the query string
        const targetUrl = `/Amprion?lat=${lat}&lng=${lng}&country=${country}`;
        window.location.href = targetUrl;
        console.log('Redirecting to:', targetUrl);
      })
      .catch(err => {
        console.error('Reverse geocoding error:', err);
        // Fallback redirect
        window.location.href = `/Amprion?lat=${lat}&lng=${lng}&country=${country}`;
      });
  });
});