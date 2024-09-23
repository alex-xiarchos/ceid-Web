document.addEventListener('DOMContentLoaded', function() {
    const logged_user = JSON.parse(localStorage.getItem("logged_user"));
    const user_id = logged_user[0].user_id;
    let rescuerLatLng = null;

    fetchRescuerLocation().then(() => {
        getOffers();
        getRequests();
        getRescuerData(user_id);
        getBaseLocation();
    });

    let baseMarker;
    let baseLocation;
    let rescuerMarker; // Define the rescuerMarker variable globally

    // Single cluster group for all markers
    var allMarkers = L.markerClusterGroup();

    // Individual layers for toggling
    var acceptedOffersMarkers = L.layerGroup();
    var pendingOffersMarkers = L.layerGroup();
    var rescuersMarkers = L.layerGroup();
    var acceptedRequestsMarkers = L.layerGroup();
    var pendingRequestsMarkers = L.layerGroup();
    var offerLines = L.layerGroup();
    var requestLines = L.layerGroup();

    // Setting up the base layer of the map
    var darktile = L.tileLayer(
        'https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=fpaRZqZBSOhVZgR5NUX7 ',
        {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.maptiler.com/">MapTiler</a>',
            maxZoom: 25
        }
    );

    var maptile = L.tileLayer(
        'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=fpaRZqZBSOhVZgR5NUX7 ',
        {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.maptiler.com/">MapTiler</a>',
            maxZoom: 25
        }
    );

    const baseIcon = L.icon({
        iconUrl: "base.svg",
        iconSize: [24, 24],
    });

    const rescuerIcon = L.icon({
        iconUrl: 'rescuer.png',
        iconSize: [16, 24], 
        draggable: true
    });

    var map = new L.Map("map", {
        zoom: 15,
        layers: [darktile],
        zoomControl: false,
    });

    var overlayMaps = {
        "Pending Requests": pendingRequestsMarkers,
        "Pending Offers": pendingOffersMarkers,
        "Assigned Requests": acceptedRequestsMarkers,
        "Assigned Offers": acceptedOffersMarkers,
        "Rescuers": rescuersMarkers,
        "Offer Lines": offerLines,
        "Request Lines": requestLines
    };
    const userMarker = new L.layerGroup();
    L.control.layers(null, overlayMaps).addTo(map);

    // Create Map Toggle mode
    var isLightMode = false;
    function toggleLayer() {
        if (isLightMode) {
            map.removeLayer(maptile);
            map.addLayer(darktile);
        } else {
            map.removeLayer(darktile);
            map.addLayer(maptile);
        }
        isLightMode = !isLightMode;
        document.querySelector('.toggle-button').innerText = isLightMode ? 'Dark Mode' : 'Light Mode';
    }

    var toggleMode = L.Control.extend({
        options: {
            position: 'topright'
        },
        onAdd: function(map) {
            var modeButton = L.DomUtil.create('button', 'toggle-button');
            modeButton.classList.add("bg-blue-500","text-white","w-full","rounded","hover:bg-blue-700");
            modeButton.innerText = 'Light Mode';
            modeButton.onclick = function() {
                toggleLayer();
            }
            return modeButton;
        }
    });

    new toggleMode().addTo(map);


    // Generalized callback function for ajax requests
    function fetchData(url, callback, ...args) { 
        $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            success: function(data) {
                if (args.length > 0) {
                    callback(data, ...args);
                } else {
                    callback(data);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching data:', error);
            }
        });
    }

    // Display REQUESTS Markers on Map
    function displayRequests(requests) {
        // Clear existing layers
        acceptedRequestsMarkers.clearLayers();
        pendingRequestsMarkers.clearLayers();
    
        requests.forEach(request => {
            // Only list requests if assigned_id is not null and matches user_id
            if (request.status === 'pending' || request.assigned_id === user_id) {
                let requestIconUrl = request.assigned_id ? "./assigned_request.png" : "./request.png";
                const requestIcon = L.icon({ iconUrl: requestIconUrl, iconSize: [16, 24] });

                // Create a new marker for the request
                let marker = L.marker([request.latitude, request.longitude], { icon: requestIcon });

                // Create a container for the popup content
                let container = L.DomUtil.create('div');

                container.innerHTML = `
                    <div>
                        <p> <strong>Request:</strong> </p>
                        <p class="info-line">Name: ${request.name}</p>
                        <p class="info-line">Phone: ${request.phone}</p>
                        <p class="info-line">Item: ${request.item_name}</p>
                        <p class="info-line">Date: ${request.created_at}</p>
                        <p class="info-line">Status: ${request.status}</p>
                        <p class="info-line">Quantity: ${request.item_quantity}</p>
                    </div>
                `;

                // Bind the popup to the marker
                marker.bindPopup(container);

                // Add the marker to the appropriate layer based on its status
                if (request.status === "accepted") {
                    acceptedRequestsMarkers.addLayer(marker);
                } else if (request.status === "pending") {
                    pendingRequestsMarkers.addLayer(marker);
                }

                // Add the marker to the cluster group
                allMarkers.addLayer(marker);

                if (request.status === 'pending') {
                    let takeRequestButton = document.createElement('button');
                        takeRequestButton.innerText = "Take Request";
                        takeRequestButton.className = "take-request-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded";
                        takeRequestButton.onclick = function() {
                            takeTask(request.id, 'request');
                        };
                        container.appendChild(takeRequestButton);
                }
                
            }
        });

        // Add the layers to the map
        map.addLayer(allMarkers);
    }

    // Display OFFER Markers on Map
    function displayOffers(offers) {
        // Clear existing layers
        acceptedOffersMarkers.clearLayers();
        pendingOffersMarkers.clearLayers();

        offers.forEach(offer => {
            if (offer.status === 'pending' || offer.assigned_id === user_id) {
                let offerIconUrl = offer.assigned_id ? "./assigned_offer.png" : "./offer.png";
                const offerIcon = L.icon({ iconUrl: offerIconUrl, iconSize: [18, 24] });

                // Create a new marker for the offer
                let marker = L.marker([offer.latitude, offer.longitude], { icon: offerIcon });

                // Create a container for the popup content
                let container = L.DomUtil.create('div');

                container.innerHTML = `
                    <div>
                        <p> <strong>Offer:</strong> </p>
                        <p class="info-line">Name: ${offer.name}</p>
                        <p class="info-line">Phone: ${offer.phone}</p>
                        <p class="info-line">Item: ${offer.item_name}</p>
                        <p class="info-line">Date: ${offer.created_at}</p>
                        <p class="info-line">Status: ${offer.status}</p>
                        <p class="info-line">Quantity: ${offer.item_quantity}</p>
                    </div>
                `;

                marker.bindPopup(container);
                if (offer.status === "accepted") {
                    acceptedOffersMarkers.addLayer(marker);
                } else if (offer.status === "pending") {
                    pendingOffersMarkers.addLayer(marker);
                }

                // Add the marker to the cluster group
                allMarkers.addLayer(marker);

                // Check if the rescuer is within 50 meters to show the "Take Offer" button
                if (rescuerLatLng) {
                    const distance = haversineDistance(rescuerLatLng.lat, rescuerLatLng.lng, parseFloat(offer.latitude), parseFloat(offer.longitude));

                    if (distance <= 1000 && offer.status === 'pending') {
                        let takeOfferButton = document.createElement('button');
                        takeOfferButton.innerText = "Take Offer";
                        takeOfferButton.className = "take-offer-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded";
                        
                        takeOfferButton.onclick = function() {
                            takeTask(offer.id, 'offer');
                            $.ajax({
                                url: "./php/update_cargo.php",  
                                method: "POST",
                                data: { offer_id: offer.id,
                                        user_id: user_id},  
                                success: function(response) {
                                    swal({
                                        title: "Success!",
                                        text: "The cargo has been updated.",
                                        icon: "success",
                                        button: "OK",
                                    });
                                },
                                error: function() {
                                    showError("An unexpected error occurred.");
                                }
                            });
                        };
                    
                        container.appendChild(takeOfferButton);
                    }                    
                }
            }
        });

        // Add the layers to the map
        map.addLayer(allMarkers);
    }

    // Fetch RESCUER and Initialize location
    function fetchRescuerLocation() {
        return new Promise((resolve, reject) => {
            fetchData('./php/fetch_rescuer_location.php', function(data) {
                if (data.latitude && data.longitude) {
                    rescuerLatLng = L.latLng(data.latitude, data.longitude);
                    initializeRescuerLocation(data.latitude, data.longitude);
                    resolve();
                } else {
                    // Center map at Patras
                    const patrasLatLng = [38.2466, 21.7346];
                    map.setView(patrasLatLng, 15);
        
                    Swal.fire({
                        title: 'No location found',
                        text: "Drag the marker to your location and click 'Save' to initialize.",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Initialize'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            let userLoc = L.marker(patrasLatLng, {
                                icon: rescuerIcon,
                                draggable: true
                            }).addTo(map);
                            userLoc.bindPopup("Drag me to your location");
                            userMarker.addLayer(userLoc);
        
                            userLoc.on('dragend', function(event) {
                                const newLocation = event.target.getLatLng();
                                Swal.fire({
                                    title: "Save this location?",
                                    showDenyButton: true,
                                    confirmButtonText: "Save",
                                    denyButtonText: `Don't save`
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        updateRescuerLocation(newLocation.lat, newLocation.lng);
                                        userLoc.closePopup();
                                        resolve();
                                        setTimeout(function() {
                                            window.location.reload();
                                        }, 1500);
                                    } else if (result.isDenied) {
                                        Swal.fire("Your location has not been updated.", "", "info");
                                        userLoc.setLatLng(patrasLatLng).update(); // Reset marker to Patras
                                        reject();
                                    }
                                });
                            });
                        } else {
                            reject();
                        }
                    });
                }
            });
        });
    }
    
    // How to move rescuer on the map
    function initializeRescuerLocation(lat, lng) {
        let userLoc = L.marker([lat, lng], {
            icon: rescuerIcon,
            draggable: true
        }).addTo(map);
        var popUp = document.createElement('div');
        popUp.innerHTML= "<h3 class='bg-blue-600 text-white font-bold hover:bg-red-600 w-full rounded'>User Location</h3>";
        userLoc.bindPopup(popUp);
        userMarker.addLayer(userLoc);
        map.setView([lat, lng], 15);
        userLoc.on('dragend', function(event) {
            var newLocation = event.target.getLatLng();
            updateRescuerLocation(newLocation.lat, newLocation.lng);
        });
        baseProximity(L.latLng(lat, lng));
    }
    
    // Update Rescuer Location on database
    function updateRescuerLocation(lat, lng) { // Add rescuerId as a parameter
        return new Promise((resolve, reject) => {
            $.ajax({
                url: './php/updateRescuerLocation.php',
                method: 'POST',
                data: { latitude: lat, longitude: lng },
                success: function(response) {
                    rescuerLatLng = L.latLng(lat, lng); // Update the rescuerLatLng variable
                    if (rescuerMarker) {
                        rescuerMarker.setLatLng([lat, lng]).update();
                        map.setView([lat, lng], 15);
                    }
                    window.location.reload();
                }
            });
        });
    }
    
    // Connect request/offer lines to the rescuer
    function displayLines(rescuers) {
        rescuers.forEach(rescuer => {
            if (rescuer.latitude && rescuer.longitude) {

                rescuer.offers.forEach(offer => {
                    let offerLocation = [offer.latitude, offer.longitude];
                    let rescuerLocation = [rescuer.latitude, rescuer.longitude];
                    let polyline = L.polyline([rescuerLocation, offerLocation], { color: '#2acacf' });
                    offerLines.addLayer(polyline);
                });

                rescuer.requests.forEach(request => {
                    let requestLocation = [request.latitude, request.longitude];
                    let rescuerLocation = [rescuer.latitude, rescuer.longitude];
                    let polyline = L.polyline([rescuerLocation, requestLocation], { color: '#af27bb' });
                    requestLines.addLayer(polyline);
                });
            }
        });
        map.addLayer(offerLines);
        map.addLayer(requestLines);
    }

    // Function to fetch and display the base location
    function getBaseLocation() {
        fetchData('./php/base_location.php', function(baseLocationData) {
            if (baseLocationData) {
                baseLocation = L.latLng(baseLocationData.latitude, baseLocationData.longitude);
                baseMarker = L.marker([baseLocationData.latitude, baseLocationData.longitude], { icon: baseIcon }).addTo(map);
                baseMarker.on('click', function() {
                    if (rescuerLatLng) { // Ensure rescuerLatLng is defined
                        baseProximity(rescuerLatLng);
                    }
                });
            }
        });
    }

    // Check if base is close so that rescuer can load/unload
    function baseProximity(userLocation) {
        const proximityThreshold = 1000; 
        if (baseLocation && userLocation) {
            const distanceToBase = userLocation.distanceTo(baseLocation);
            let container = L.DomUtil.create('div'); 
    
            if (distanceToBase <= proximityThreshold) {
                container.innerHTML = `
                    <button onclick="window.open('rescuer_items.html', '_blank');" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded">Load/Unload Items</button>
                `;
            } else {
                container.innerHTML = `
                    <h1 class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded">You are far away from Base!</h1>
                `;
            }
            L.popup()
                .setLatLng(baseLocation)
                .setContent(container)
                .openOn(map);
        }
    }
    
    // Rescuer cannot take more than 4 requests
    function takeTask(taskId, taskType) {
        $.ajax({
            url: `./php/takeTask.php`,
            method: 'POST',
            data: { task_id: taskId, task_type: taskType, user_id: user_id },
            success: function(response) {
                if (response == '4') {
                    Swal.fire("Can't take more than 4 tasks!", "", "info");
                } else  {
                    Swal.fire("Task taken successfully!", "", "success");
                    setTimeout(function() {
                        window.location.reload();
                    }, 1500) 
                }
            },
            error: function(xhr, status, error) {
                console.error('Error taking task:', error);
                Swal.fire("Failed to take the task.", "", "error");
            }
        });
    }

    function getOffers() {
        fetchData('./php/offers.php', displayOffers);
    }

    function getRequests() {
        fetchData('./php/requests.php', displayRequests);
    }

    function getRescuerData(user_id) {
        fetchData(`./php/rescuer_location.php?user_id=${user_id}`, displayLines, user_id);
    }

    // Haversine formula to calculate the distance between two points on the Earth's surface
    function haversineDistance(lat1, lon1, lat2, lon2) {
        const toRadians = angle => (angle * Math.PI) / 180;

        const R = 6371e3; // Radius of the Earth in meters
        const phi1 = toRadians(lat1);
        const phi2 = toRadians(lat2);
        const deltaPhi = toRadians(lat2 - lat1);
        const deltaLambda = toRadians(lon2 - lon1);

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in meters
        return distance;
    }
});
