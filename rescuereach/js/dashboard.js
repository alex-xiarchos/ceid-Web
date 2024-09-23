$(document).ready(function() {
    loadDashboardSummary();
    fetchActiveVehicles();
    registeredUsers();
    loadCategoriesAndItems();
    loadAnnouncementSummary();
    
    $('#category').on('change', function() {
        filterItemsByCategory($(this).val());
    });
    $('.custom-select').on('change', function () {
        $(this).find('option').removeClass('selected');
        $(this).find('option:selected').addClass('selected');
    });
});

// ========================== QUICK SUMMARY =========================
// Fetch Items for Summary
function loadDashboardSummary() {
    $.ajax({
        url: './php/summary.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                $('#totalItems').text(response.totalItems);
                $('#lowStockItems').text(response.lowStockItems);
            } else {
                console.error('Failed to load dashboard summary');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX error:', status, error);
        }
    });
}

// Fetch Vehicles for Summary
function fetchActiveVehicles() {
    $.ajax({
        url: './php/active_vehicles.php',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log("Active Vehicles Data:", data); 
            if (data.success) {
                const activeVehiclesElement = document.getElementById('activeVehicles');
                const totalVehiclesElement = document.getElementById('totalVehicles');
                
                activeVehiclesElement.textContent = data.activeVehicles;
                totalVehiclesElement.textContent = data.totalVehicles; 
            } else {
                console.error('Error in the response data:', data.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching active vehicles:', error);
        }
    });
}

// Fetch Users for Summary 
function registeredUsers() {
    fetch('./php/registered_users.php')
    .then(response => response.json())
    .then(users => {
        populateTable(users);
    })
    .catch(error => {
        console.error('Error fetching users:', error);
    });
}

// Populate Users Table Summary
function populateTable(users) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = ''; 
    users.forEach((user) => {
        let userTypeText = '';
        if (user.user_type === 'r') {
            userTypeText = 'rescuer';
        } else if (user.user_type === 'c') {
            userTypeText = 'citizen';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-4 px-6 border-b border-grey-light">${user.username}</td>
            <td class="py-4 px-6 border-b border-grey-light">${user.name}</td>
            <td class="py-4 px-6 border-b border-grey-light">${userTypeText}</td>
        `;

        if (userTypeText === 'rescuer') {
            // Add tooltip with vehicle cargo items
            tr.setAttribute('title', user.cargo_items ? `Items: ${user.cargo_items}` : 'No items in vehicle');
            tr.classList.add('tooltip2'); 
        }

        tableBody.appendChild(tr);
    });
}

// ========================= CREATE ANNOUNCEMENT =========================
// Fetch Categories and Items 
function loadCategoriesAndItems() {
    $.ajax({
        type: "GET",
        url: "./php/announcement.php", 
        dataType: "json",
        success: function(response) {
            if (response.error) {
                console.error("Error loading categories and items:", response.error);
                return;
            }
            
            var categoriesDropdown = $("#category");

            // Populate categories dropdown
            categoriesDropdown.empty();
            categoriesDropdown.append(`<option value="">Select Category</option>`);
            response.categories.forEach(function(category) {
                categoriesDropdown.append(`<option value="${category.id}">${category.name}</option>`);
            });

            // Store items data for filtering
            window.items = response.items; // ???
        },
        error: function(error) {
            console.error("Error loading categories and items:", error);
        }
    });
}

function filterItemsByCategory(categoryId) {
    var itemsDropdown = $("#announcement");
    itemsDropdown.empty();

    if (categoryId) {
        var filteredItems = window.items.filter(function(item) {
            return item.category_id == categoryId;
        });

        filteredItems.forEach(function(item) {
            itemsDropdown.append(`<option value="${item.id}">${item.name}</option>`);
        });
    }
}

// Create new Announcement 
$('#announcement_items').on('submit', function(e) {
    e.preventDefault();
    var selectedItemIds = $('#announcement').val(); // Get selected item IDs
    var quantity = $('#quantity').val(); // Get the quantity

    if (selectedItemIds.length > 0) {
        // Get item names from the dropdown options
        var selectedItemNames = selectedItemIds.map(id => {
            return $("#announcement option[value='" + id + "']").text();
        });

        // Create the notification message with item names
        var message = ` Announcement created for ${selectedItemNames.join(', ')}!`;

        $.ajax({
            url: './php/insert_announcement.php', 
            method: 'POST',
            data: { ids: selectedItemIds, quantity: quantity },
            success: function(response) {
                // Display a success message to the admin
                if (response ==1){
                    Swal.fire({
                        title: 'Announcement',
                        text: message,
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });

                    $('#announcement_items')[0].reset();
                    $('#announcement').empty();
                    loadAnnouncementSummary();
                }
            }
        });
    } else {
        // Display an error message if no items are selected
        Swal.fire('Error', 'No items selected', 'error');
    }
});

// ========================= CREATE RESCUER ACCOUNT =========================
// Create new Rescuer
document.getElementById('createRescuerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Function to create rescuer account
    function createRescuerAccount() {
        return new Promise((resolve, reject) => {
            // Get form data
            var name = document.getElementById('rescuerName').value;
            var username = document.getElementById('rescuerUsername').value;
            var email = document.getElementById('rescuerEmail').value;
            var password = document.getElementById('rescuerPassword').value;
            var phone = document.getElementById('rescuerPhone').value;

            // Make an AJAX POST request to create the rescuer account
            $.ajax({
                url: './php/create_rescuer.php', 
                type: 'POST',
                data: {
                    'name': name,
                    'username': username,
                    'email': email,
                    'password': password,
                    'phone': phone
                },
                success: function(response) {
                    // Resolve the promise on success
                    resolve(response);
                },
                error: function(xhr, status, error) {
                    // Reject the promise on error
                    reject(error);
                }
            });
        });
    }

    // Call createRescuerAccount and handle the promise
    createRescuerAccount().then(response => {
        Swal.fire('Success', 'Rescuer account created successfully!', 'success');
        registeredUsers();
        $('#createRescuerForm')[0].reset();
    }).catch(error => {
        Swal.fire('Error', 'Error creating account. Please try again.', 'error');
    });
});

// ========================= ANNOUNCEMENT TABLE =========================
// Populate Announcements Table
function loadAnnouncementSummary() {
    $.ajax({
        url: './php/get_ann.php',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            var tableBody = $('#announcementSummaryTableBody');
            tableBody.empty();

            // Iterate through each announcement and add a row to the table
            data.forEach(function(announcement) {
                var row = `
                    <tr>
                        <td class="py-2 px-4 border-b border-gray-600">${announcement.announcement_id}</td>
                        <td class="py-2 px-4 border-b border-gray-600">${announcement.quantity}</td>
                        <td class="py-2 px-4 border-b border-gray-600">${announcement.item_name}</td>
                    </tr>
                `;
                tableBody.append(row);
            });
        },
        error: function(xhr, status, error) {
            console.error("Error fetching announcements:", error);
        }
    });
}

// ========================= GRAPHS MODAL =========================
// Generate Graphs
document.getElementById('graphGenerationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const graphType = document.getElementById('graphType').value;

    // Function to fetch graph data
    function fetchGraphData() {
        return new Promise((resolve, reject) => {
            const url = graphType === 'offers' 
                        ? `./php/graph_offers.php?startDate=${startDate}&endDate=${endDate}`
                        : `./php/graph_requests.php?startDate=${startDate}&endDate=${endDate}`;

            $.ajax({
                url: url,
                type: 'GET',
                success: function(data) {
                    resolve(data);
                },
                error: function(xhr, status, error) {
                    reject(error);
                }
            });
        });
    }

    // Call fetchGraphData and handle the promise
    fetchGraphData().then(data => {
        const titleCaseGraphType = graphType.charAt(0).toUpperCase() + graphType.slice(1);
        const chartTitle = `${titleCaseGraphType}`;
        const datasetLabel = `Number of ${titleCaseGraphType} by Status`;
        Swal.fire({
            title: chartTitle,
            html: '<canvas id="swalChart" class="bg-gray-800" width="400" height="400"></canvas>',
            background: '#1d2430',
            color: 'red',
            willOpen: () => {
                const swalCtx = Swal.getPopup().querySelector('#swalChart').getContext('2d');
                const myChart = new Chart(swalCtx, {
                    type: 'bar',
                        data: {
                            labels: ['Pending','Accepted', 'Cancelled', 'Completed'],
                            datasets: [{
                                label: datasetLabel,
                                data: [data.pending, data.accepted, data.cancelled, data.completed],
                                backgroundColor: [
                                    'rgba(249, 105, 114, 0.5)', //Orange
                                    'rgba(54, 162, 235, 0.5)', // Blue
                                    'rgba(255, 99, 132, 0.5)', // Red
                                    'rgba(75, 192, 192, 0.5)' // Green
                                ],
                                borderColor: [
                                    'rgba(249, 105, 114, 0.5)', //Orange
                                    'rgba(54, 162, 235, 1)', // Blue
                                    'rgba(255, 99, 132, 1)', // Red
                                    'rgba(75, 192, 192, 1)' // Green
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            maintainAspectRatio: true,
                            aspectRatio: 2,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                },
            didClose: () => {
                if (myChart) {
                    myChart.destroy();
                }
            }
        });
    }).catch(error => {
        console.error('Error fetching graph data:', error);
        Swal.fire('Error', 'Error fetching graph data. Please try again.', 'error');
    });
});

// Function to open the modal
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

// Function to close the modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}