// function openModal() {
//     document.getElementById('mapModal').classList.remove('hidden');
//     document.getElementById('mapModal').classList.add('flex');
//     setTimeout(() => initializeMap(), 100); // Delay to ensure the modal is visible
// }

// function closeModal() {
//     document.getElementById('mapModal').classList.remove('flex');
//     document.getElementById('mapModal').classList.add('hidden');
// }

// Initialize the map when the modal is opened
function initializeMap() {
    const map = L.map('map').setView([38.2466, 21.7346], 14); // Centered on Patras

    var darktile = L.tileLayer(
        'https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=fpaRZqZBSOhVZgR5NUX7 ',
        {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.maptiler.com/">MapTiler</a>',
            maxZoom: 25
        }
    );
    darktile.addTo(map);
    var userIcon = L.icon({
        iconUrl: 'user.png',iconSize: [24,24]});
    const marker = L.marker([38.2466, 21.7346],{ icon: userIcon }).addTo(map);
    

    map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        document.getElementById('location').value = e.latlng.lat + ", " + e.latlng.lng;
        console.log(e.latlng.lat,e.latlng.lng);
    });
}

// Open modal and initialize map
function openModal() {
    document.getElementById('mapModal').classList.remove('hidden');
    document.getElementById('mapModal').classList.add('flex');
    setTimeout(() => initializeMap(), 100); // Delay to ensure the modal is visible
}

// Close modal
function closeModal() {
    document.getElementById('mapModal').classList.remove('flex');
    document.getElementById('mapModal').classList.add('hidden');
}

function signup() {
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;

    if (!user || !pass || !name || !email || !phone || !location) {
        Swal.fire('Error', 'Please fill all the fields and set your location.', 'error');
        return;
    }

    $.ajax({
        url: './php/register_user.php',
        type: 'POST',
        data: {
            user: user,
            pass: pass,
            name: name,
            email: email,
            phone: phone,
            location: location
        }
    });

    Swal.fire('Success', 'User registered successfully!', 'success').then(() => {
        window.location.href = 'index.html';
    });
}
