document.addEventListener('DOMContentLoaded', function() {
    getOffers();
    getRequests();
    getRescuerData();
    getBaseLocation();

    var baseMarker;
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

    var map = new L.Map("map", {
        zoom: 15,
        layers: [darktile],
        zoomControl: false,
    });

    $.ajax({
        url: "./php/base_location.php",
        type: "POST",
        dataType: "json",
        success: function(response) {
            map.setView(new L.LatLng(response.latitude, response.longitude), 15);
        },
        error: function() {
            console.error("Error fetching the location");
        }
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

    L.control.layers(null, overlayMaps).addTo(map);

    // Toggle Map Mode
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

    new toggleMode().addTo(map);

    function fetchData(url, callback) {
        $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            success: function(data) {
                callback(data);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching data:', error);
            }
        });
    }

    // Add REQUEST markers
    function displayRequests(requests) {
        // Clear existing layers
        acceptedRequestsMarkers.clearLayers();
        pendingRequestsMarkers.clearLayers();
        // requestsData = requests; // Update requests data

        requests.forEach(request => {
            // Determine the appropriate icon based on the request status
            let requestIconUrl = request.assigned_id ? "./assigned_request.png" : "./request.png";
            const requestIcon = L.icon({ iconUrl: requestIconUrl, iconSize: [16, 24] });

            // Create a new marker for the request
            let marker = L.marker([request.latitude, request.longitude], { icon: requestIcon });

            // Create a container for the popup content
            let container = L.DomUtil.create('div');

            // Populate the container with appropriate request details
            if (!request.assigned_id) {
                container.innerHTML = `
                <div>
                    <p> <strong>Request:</strong></p>
                    <p class="info-line">Name: ${request.name}</p>
                    <p class="info-line">Phone: ${request.phone}</p>
                    <p class="info-line">Item: ${request.item_name}</p>
                    <p class="info-line">Date: ${request.created_at}</p>
                    <p class="info-line">Status: ${request.status}</p>
                    <p class="info-line">Quantity: ${request.item_quantity}</p>
                    <p> Request status is pending...</p>
                </div>`;
            } else {
                requestIconUrl = "./assigned_request.png"
                container.innerHTML = `
                <div>
                    <p> <strong>Request:</strong></p>
                    <p class="info-line">Name: ${request.name}</p>
                    <p class="info-line">Phone: ${request.phone}</p>
                    <p class="info-line">Item: ${request.item_name}</p>
                    <p class="info-line">Date: ${request.created_at}</p>
                    <p class="info-line">Status: ${request.status}</p>
                    <p class="info-line">Quantity: ${request.item_quantity}</p>
                    <p>Assigned to: ${request.assigned_name} - Rescuer ID: ${request.assigned_id}</p>
                    <p>Rescuer Phone: ${request.assigned_phone}</p>
                </div>
                `;
            }

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
        });

        // Add the layers to the map
        map.addLayer(allMarkers);
    }

    // Add OFFER markers
    function displayOffers(offers) {
        // Clear existing layers
        acceptedOffersMarkers.clearLayers();
        pendingOffersMarkers.clearLayers();
        //offersData = offers; // Update offers data

        offers.forEach(offer => {
            // Determine the appropriate icon based on the offer status
            let offerIconUrl = offer.assigned_id ? "./assigned_offer.png" : "./offer.png";
            const offerIcon = L.icon({ iconUrl: offerIconUrl, iconSize: [18, 24] });

            // Create a new marker for the offer
            let marker = L.marker([offer.latitude, offer.longitude], { icon: offerIcon });

            // Create a container for the popup content
            let container = L.DomUtil.create('div');

            // Populate the container with appropriate offer details
            if (!offer.assigned_id) {
                container.innerHTML = `
                <div>
                    <p> <strong>Offer:</strong></p>
                    <p class="info-line">Name: ${offer.name}</p>
                    <p class="info-line">Phone: ${offer.phone}</p>
                    <p class="info-line">Item: ${offer.item_name}</p>
                    <p class="info-line">Date: ${offer.created_at}</p>
                    <p class="info-line">Status: ${offer.status}</p>
                    <p class="info-line">Quantity: ${offer.item_quantity}</p>
                    <p> Offer status is pending...</p>
                </div>
                `;
            } else {
                container.innerHTML = `
                <div>
                    <p> <strong>Offer:</strong></p>
                    <p class="info-line">Name: ${offer.name}</p>
                    <p class="info-line">Phone: ${offer.phone}</p>
                    <p class="info-line">Item: ${offer.item_name}</p>
                    <p class="info-line">Date: ${offer.created_at}</p>
                    <p class="info-line">Status: ${offer.status}</p>
                    <p class="info-line">Quantity: ${offer.item_quantity}</p>
                    <p>Assigned to: ${offer.assigned_name} - Rescuer ID: ${offer.assigned_id}</p>
                    <p>Rescuer Phone: ${offer.assigned_phone}</p>
                </div>
                `;
                
            }

            // Bind the popup to the marker
            marker.bindPopup(container);

            // Add the marker to the appropriate layer based on its status
            if (offer.status === "accepted") {
                acceptedOffersMarkers.addLayer(marker);
            } else if (offer.status === "pending") {
                pendingOffersMarkers.addLayer(marker);
            }

            // Add the marker to the cluster group
            allMarkers.addLayer(marker);
        });

        // Add the layers to the map
        map.addLayer(allMarkers);
    }

    // Add RESCUERS markers
    function displayRescuers(rescuers) {
        rescuersMarkers.clearLayers();
        // rescuerDataMap = {}; // Clear existing rescuer data

        rescuers.forEach(rescuer => {
            if (rescuer.latitude && rescuer.longitude) {
                // rescuerDataMap[rescuer.user_id] = {
                //     latitude: rescuer.latitude,
                //     longitude: rescuer.longitude,
                //     name: rescuer.name,
                //     phone: rescuer.phone
                // };

                const rescuerIcon = L.icon({
                    iconUrl: 'rescuer.png',
                    iconSize: [16, 24]
                });

                let rescuerMarker = L.marker([rescuer.latitude, rescuer.longitude], { icon: rescuerIcon });
               // Assuming you are receiving 'rescuer' object from your PHP JSON response
               rescuerMarker.bindPopup(
                `<p class="info-line">Name: ${rescuer.name}</p>
                 <p class="info-line">Phone: ${rescuer.phone}</p>
                 ${generateCargo(rescuer.cargo)}
                `
                );
            
                // Function to generate the cargo list in bubble format
                function generateCargo(cargo) {
                    if (cargo.length === 0) {
                        return `<p class="info-line">No cargo available</p>`;
                    }
                
                    let cargoContent = '<p class="info-line"></p>'; 
                    cargo.forEach(item => {
                        if (item.quantity > 0) {
                            cargoContent += `<div class="cargo-bubble">${item.name}: ${item.quantity}</div>`;
                        }
                    });
                    cargoContent += '</div>';
                    
                    return cargoContent;
                }

                // Add the marker to the rescuers layer
                rescuersMarkers.addLayer(rescuerMarker);

                // Add the marker to the cluster group
                allMarkers.addLayer(rescuerMarker);

                // Draw lines from the rescuer to each of their assigned offers
                rescuer.offers.forEach(offer => {
                    let offerLocation = [offer.latitude, offer.longitude];
                    let rescuerLocation = [rescuer.latitude, rescuer.longitude];
                    let polyline = L.polyline([rescuerLocation, offerLocation], { color: '#2acacf' });
                    offerLines.addLayer(polyline);
                });

                // Draw lines from the rescuer to each of their assigned requests
                rescuer.requests.forEach(request => {
                    let requestLocation = [request.latitude, request.longitude];
                    let rescuerLocation = [rescuer.latitude, rescuer.longitude];
                    let polyline = L.polyline([rescuerLocation, requestLocation], { color: '#af27bb' });
                    requestLines.addLayer(polyline);
                });
            }
        });

        // Add the layers to the map
        map.addLayer(allMarkers);
        map.addLayer(offerLines);
        map.addLayer(requestLines);
    }


    // Function to fetch, display and move the base location
    function getBaseLocation() {
        fetchData('./php/base_location.php', function(baseLocation) {
            if (baseLocation) {
                originalPosition = { lat: baseLocation.latitude, lng: baseLocation.longitude };
                baseMarker = L.marker([baseLocation.latitude, baseLocation.longitude], { icon: baseIcon, draggable: true })
                    .addTo(map)
                    .on('dragstart', function(event) {
                        originalPosition = baseMarker.getLatLng(); // Save original position before dragging
                    })
                    .on('dragend', function(event) {
                        var newLocation = event.target.getLatLng();
                        updateBaseLocation(newLocation.lat, newLocation.lng);
                    });
            }
        });
    }

    // Function to update the base location in the database
    function updateBaseLocation(lat, lng) {
        return new Promise((resolve, reject) => {
            Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to update the base location?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, update it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: './php/update_base_location.php',
                        method: 'POST',
                        data: { latitude: lat, longitude: lng },
                        success: function(response) {
                            console.log('Base location updated:', response);
                            // Update the marker position on the map
                            baseMarker.setLatLng([lat, lng]);
                            resolve(response); // Resolve the promise
                        },
                        error: function(xhr, status, error) {
                            console.error('Error updating base location:', error);
                            reject(error); // Reject the promise
                        }
                    });
                } else {
                    // Revert to the original position if the user cancels
                    baseMarker.setLatLng(originalPosition);
                    reject('Update cancelled by user'); // Reject the promise if user cancels
                }
            });
        });
    }

    function getOffers() {
        fetchData('./php/offers.php', displayOffers);
    }

    function getRequests() {
        fetchData('./php/requests.php', displayRequests);
    }

    function getRescuerData() {
        fetchData('./php/rescuer_locations.php', displayRescuers);
    }
});
