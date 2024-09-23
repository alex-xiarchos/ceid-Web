$(document).ready(function() {
    quickSummary();
    activeVehicles();
});

function quickSummary() {
    $.ajax({
        type: "GET",
        url: "./php/summary.php", 
        dataType: "json",
        success: function(response) {
            if (response.success) {
                $('#totalItems').text(response.totalItems);
                $('#lowStockItems').text(response.lowStockItems);
            } else {
                console.error("Error fetching summary data:", response.message);
            }
        },
        error: function(error) {
            console.error("Error loading items for admin:", error);
        }
    });
}

function activeVehicles() {
    $.ajax({
        type: "GET",
        url: "./php/active_vehicles.php", 
        dataType: "json",
        success: function(response) {
            if (response.success) {
                $('#activeVehicles').text(response.activeVehicles);
            } else {
                console.error("Error fetching summary data:", response.message);
            }
        },
        error: function(error) {
            console.error("Error loading items for admin:", error);
        }
    });
}

// Function to open modals
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

// Function to close modals
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

const logged_user = JSON.parse(localStorage.getItem("logged_user"));
      if (!logged_user) 
        // If no logged user, redirect to login page
        window.location.href = "./index.html";
      