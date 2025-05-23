document.addEventListener("DOMContentLoaded", function () {
  const map = L.map('simple-map').setView([25, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let marker;

  map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    if (marker) map.removeLayer(marker);

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        const country = data.address.country || "Unknown Location";
        console.log('Country:', country);
        // marker = L.marker([lat, lng]).addTo(map)
        //   .bindPopup(country)
        //   .openPopup();
      })
    //   .catch(err => {
    //     console.error('Reverse geocoding error:', err);
    //     marker = L.marker([lat, lng]).addTo(map)
    //       .bindPopup("Location")
    //       .openPopup();
    //   });
  });
});