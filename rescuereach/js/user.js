const logged_user = JSON.parse(localStorage.getItem("logged_user"));
const user_id = logged_user[0].user_id;
const user_name = logged_user[0].username;

$(document).ready(function () {
    const welcomeMessageElement = $('#welcomeMessage');
    welcomeMessageElement.html(`Welcome back, <span id="userNameSpan" class="text-red-700 cursor-pointer">${user_name}</span>`);

    // Open modal on username click and populate form with existing user data
    $('#userNameSpan').click(function () {
        $.ajax({
            url: 'php/get_user_data.php',
            type: 'GET',
            data: { user_id: user_id }, // Send the user ID with the request
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    // Populate form with existing user data
                    $('#username').val(response.data.username);
                    $('#email').val(response.data.email);
                    $('#telephone').val(response.data.phone);

                    // Show the modal
                    $('#userModal').removeClass('hidden');
                } else {
                    Swal.fire('Error', 'Could not fetch user data', 'error');
                }
            },
            error: function(xhr, status, error) {
                Swal.fire('Error', 'An error occurred while fetching user data', 'error');
            }
    });
    });
    
    // Close modal on cancel button click
    $('#closeModal').click(function () {
        $('#userModal').addClass('hidden');
    });

    // Update user data
    $('#updateUserForm').submit(function (event) {
        event.preventDefault();

        // Check if all fields are filled
        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const phone = $('#telephone').val().trim();
        const password = $('#password').val().trim();

        if (!username || !email || !phone || !password) {
            Swal.fire('Error', 'All fields must be filled.', 'error');
            return;
        }

        const updatedUserData = {
            user_id: user_id,
            username: username,
            email: email,
            phone: phone,
            password: password
        };

        $.ajax({
            url: './php/update_user.php', 
            type: 'POST',
            data: updatedUserData,
            success: function (response) {
                response = JSON.parse(response);
                if (response == 1) {
                    Swal.fire('Success', 'User information updated successfully', 'success');
                    // Update local storage and UI with new data
                    localStorage.setItem('logged_user', JSON.stringify([updatedUserData]));
                    welcomeMessageElement.html(`Welcome back, <span id="userNameSpan" class="text-red-700 cursor-pointer">${updatedUserData.username}</span>`);
                    $('#userModal').addClass('hidden');
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function (xhr, status, error) {
                Swal.fire('Error', 'There was an error updating your information', 'error');
            }
        });
    });

    fetchTasks();
    loadCategoriesAndItems();
    loadAnnouncements();
    $('#category').on('change', function () {
        filterItemsByCategory($(this).val());
    });
});

// Fetch categories, display and search for items
function loadCategoriesAndItems() {
    $.ajax({
        type: "GET",
        url: "./php/announcement.php",
        dataType: "json",
        success: function (response) {
            if (response.error) {
                console.error("Error loading categories and items:", response.error);
                return;
            }

            var categoriesDropdown = $("#category");

            // Populate the category dropdown
            categoriesDropdown.empty();
            categoriesDropdown.append(`<option value="">All Categories</option>`);
            response.categories.forEach(function (category) {
                categoriesDropdown.append(`<option value="${category.id}">${category.name}</option>`);
            });

            // Store items globally
            window.items = response.items;
            displayItems(window.items);

            // Initialize autocomplete
            var itemNames = window.items.map(function (item) {
                return { label: item.name, value: item.id };
            });

            // Autocomplete item search
            $('#itemSearch').autocomplete({
                source: function (request, response) {
                    var results = $.ui.autocomplete.filter(itemNames, request.term);
                    response(results);
                },
                minLength: 2, // autocomplete triggers after 2 characters
                select: function (event, ui) {
                    // Handle item selection
                    var selectedItem = ui.item;
                    var itemElement = $(`.item-entry[data-item-id='${selectedItem.value}']`);

                    // Highlight the selected item in the items container
                    if (itemElement.attr('data-selected') === 'true') {
                        itemElement.attr('data-selected', 'false').removeClass('bg-blue-500').addClass('bg-gray-700');
                    } else {
                        itemElement.attr('data-selected', 'true').removeClass('bg-gray-700').addClass('bg-blue-500');
                    }

                    // Clear the search input
                    $('#itemSearch').val('');
                    return false; // Prevent default behavior (setting input value to selected label)
                }
            });
        },
        error: function (error) {
            console.error("Error loading categories and items:", error);
        }
    });
}

// Graphic display of items buttons, on click change color etc
function displayItems(items) {
    var itemsContainer = $("#announcementContainer");
    itemsContainer.empty();

    // Display items in the container
    items.forEach(function (item) {
        var itemDiv = $('<div>')
            .addClass('flex items-center space-x-2 item-entry bg-gray-700 text-white px-3 py-1 rounded cursor-pointer')
            .attr('data-item-id', item.id)
            .attr('data-item-name', item.name.toLowerCase())
            .attr('data-selected', 'false') // Custom attribute to track selection
            .text(item.name)
            .on('click', function () {
                // Toggle selection state and color
                var isSelected = $(this).attr('data-selected') === 'true';
                if (isSelected) {
                    $(this).attr('data-selected', 'false').removeClass('bg-blue-500').addClass('bg-gray-700');
                } else {
                    $(this).attr('data-selected', 'true').removeClass('bg-gray-700').addClass('bg-blue-500');
                }
            });

        itemsContainer.append(itemDiv);
    });
}

// Filter items by category
$('#category').on('change', function () {
    var selectedCategoryId = $(this).val();
    var filteredItems;

    if (selectedCategoryId) {
        // Filter items by selected category
        filteredItems = window.items.filter(function (item) {
            return item.category_id == selectedCategoryId;
        });
    } else {
        // If no category is selected, show all items
        filteredItems = window.items;
    }

    // Display the filtered items
    displayItems(filteredItems);
});

// Create a REQUEST for an item
$('#request_items').on('submit', function (e) {
    e.preventDefault();
    var selectedItemIds = [];

    // Find selected items
    $(".item-entry[data-selected='true']").each(function () {
        selectedItemIds.push($(this).attr('data-item-id'));
    });

    var quantity = $('#quantity').val();

    if (selectedItemIds.length > 0) {
        var selectedItemNames = selectedItemIds.map(id => {
            return $(`.item-entry[data-item-id='${id}']`).text();
        });

        var message = `Request created for ${selectedItemNames.join(', ')}!`;

        $.ajax({
            url: './php/insert_request.php',
            method: 'POST',
            data: { ids: selectedItemIds, quantity: quantity, citizen_id: user_id },
            success: function (response) {
                Swal.fire({
                    title: 'Request Created!',
                    text: message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            }
        });

        Swal.fire({
            title: 'Request',
            text: message,
            icon: 'success',
            confirmButtonText: 'OK'
        });

        $('#request_items')[0].reset();
        fetchTasks();
        loadCategoriesAndItems();
    } else {
        Swal.fire('Error', 'No items selected', 'error');
    }

    fetchTasks();
});

// Fetch and Display Announcements table
function loadAnnouncements() {
    $.ajax({
        type: "GET",
        url: "./php/get_announcements.php",
        data: { user_id: user_id },
        dataType: "json",
        success: function (response) {
            if (response.error) {
                console.error("Error loading announcements:", response.error);
                return;
            }

            var announcementsTableBody = $("#announcementsTableBody");
            announcementsTableBody.empty();
            response.announcements.forEach(function (announcement) {
                // Create Offer Button
                var button = $('<button>')
                    .attr('type', 'button')
                    .addClass('create-offer bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline')
                    .attr('data-an_id', announcement.an_id) // Use announcement ID
                    .attr('data-id', announcement.id)      // Use item ID
                    .attr('data-quantity', announcement.quantity)
                    .text(`Create Offer for ${announcement.name}`);

                // Cancel Offer Button
                var cancelButton = $('<button>')
                    .attr('type', 'button')
                    .addClass('cancel-offer bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-2')
                    .attr('data-an_id', announcement.an_id)
                    .attr('data-id', announcement.id)
                    .text('Cancel Offer')
                    .hide(); // Hide the cancel button initially

                // Disable the button if an offer already exists and show cancel button only for that specific announcement
                if (announcement.offerExists === "1") {
                    if (announcement.status === 'canceled') {
                        button.prop('disabled', false)
                              .removeClass('bg-gray-400 cursor-not-allowed')
                              .addClass('bg-blue-700 hover:bg-blue-800')
                              .text(`Create Offer for ${announcement.name}`);
                    } else {
                        button.prop('disabled', true)
                              .removeClass('bg-blue-700 hover:bg-blue-800')
                              .addClass('bg-gray-400 cursor-not-allowed')
                              .text(`Offer submitted!`);
                        cancelButton.show(); // Show the cancel button only for this specific announcement
                    }
                }

                var row = $(`
                    <tr>
                        <td class="px-4 py-2">${announcement.name}</td>
                        <td class="px-4 py-2">${announcement.quantity}</td>
                        <td class="px-8 py-2"></td>
                    </tr>
                `);

                row.find('td:last-child').append(button).append(cancelButton);
                announcementsTableBody.append(row);
            });

            // Event listener - Fetch Create offer to the database
            $(".create-offer").click(function () {
                var announcementId = $(this).data("an_id");
                var itemId = $(this).data("id");
                var announcementQ = $(this).data("quantity");
                var announcementU = Number(user_id);

                $.ajax({
                    type: "POST",
                    url: "./php/create_offer.php",
                    data: { item_id: itemId, quantity: announcementQ, user_id: announcementU }, 
                    success: function (response) {
                        if (response == 1) {
                            Swal.fire({
                                title: 'Offer Created!',
                                text: 'The offer was created successfully.',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                window.location.reload();
                            });
                    
                            // Disable the button and gray it out after successful offer creation
                            $(`button[data-an_id="${announcementId}"][data-id="${itemId}"].create-offer`)
                                .prop('disabled', true)
                                .removeClass('bg-blue-700 hover:bg-blue-800')
                                .addClass('bg-gray-400 cursor-not-allowed')
                                .text(`Offer submitted!`);
                    
                            // Show the cancel button only for this specific announcement
                            $(`button[data-an_id="${announcementId}"][data-id="${itemId}"].cancel-offer`).show();
                        } else {
                            Swal.fire({
                                title: 'Error',
                                text: 'There was an error creating the offer.',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    },
                    error: function (error) {
                        console.error("Error creating offer:", error);
                        Swal.fire({
                            title: 'Error',
                            text: 'There was an error creating the offer.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                });
                fetchTasks();
            });

            // Add event listener for the CANCEL OFFER buttons
            $(".cancel-offer").click(function () {
                var announcementId = $(this).data("an_id");
                var itemId = $(this).data("id");
                
                $.ajax({
                    type: "POST",
                    url: "./php/user_cancel_offer.php", 
                    data: { item_id: itemId, user_id: user_id },
                    success: function (response) {
                        if (response == 1) {
                            Swal.fire({
                                title: 'Offer Canceled!',
                                text: 'The offer was canceled successfully.',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            });
                    
                            loadAnnouncements();
                    
                            // Re-enable the create offer button after cancellation for this specific announcement
                            $(`button[data-an_id="${announcementId}"][data-id="${itemId}"].create-offer`)
                                .prop('disabled', false)
                                .removeClass('bg-gray-400 cursor-not-allowed')
                                .addClass('bg-blue-700 hover:bg-blue-800')
                                .text(`Create Offer for ${announcement.name}`);
                    
                            // Hide the cancel button for this specific announcement
                            $(`button[data-an_id="${announcementId}"][data-id="${itemId}"].cancel-offer`).hide();
                        }
                    },
                    error: function (error) {
                        console.error("Error canceling offer:", error);
                        Swal.fire({
                            title: 'Error',
                            text: 'There was an error canceling the offer.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                });
                fetchTasks();
            });
        }
    });
}

// Sidebar load My Offers/Requests 
function fetchTasks() {
    $.ajax({
        url: './php/user_data.php',
        type: 'POST',
        data: { user_id: user_id },
        dataType: 'json',
        success: function (data) {
            if (data.success) {
                const userRequestsElement = document.getElementById('userRequests');
                const userOffersElement = document.getElementById('userOffers');

                // Clear any existing content
                userRequestsElement.innerHTML = '';
                userOffersElement.innerHTML = '';

                // Append user requests
                data.userRequests.forEach(request => {
                    const requestItem = document.createElement('div');
                    requestItem.className = 'bg-gray-700 p-2 mb-2 rounded';
                    // time format
                    const createdAt = new Date(request.created_at);
                    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
                    const optionsTime = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
                    const formattedDate = createdAt.toLocaleDateString(undefined, optionsDate);
                    const formattedTime = createdAt.toLocaleTimeString(undefined, optionsTime);
                    requestItem.innerHTML = `
                        <p><strong>ID:</strong> ${request.id}</p>
                        <p><strong>Item:</strong> ${request.name}</p>
                        <p><strong>Status:</strong> ${request.status}</p>
                        <p><strong>Quantity:</strong> ${request.rquantity}</p>
                        <p class="text-red-700">Created on ${formattedDate} at ${formattedTime}</p>
                    `;
                    
                    userRequestsElement.appendChild(requestItem);
                });
                // Append user offers
                data.userOffers.forEach(offer => {
                    const offerItem = document.createElement('div');
                    offerItem.className = 'bg-gray-700 p-2 mb-2 rounded';
                    // time format
                    const createdAt = new Date(offer.created_at);
                    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
                    const optionsTime = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
                    const formattedDate = createdAt.toLocaleDateString(undefined, optionsDate);
                    const formattedTime = createdAt.toLocaleTimeString(undefined, optionsTime);
                    offerItem.innerHTML = `
                        <p><strong>ID:</strong> ${offer.id}</p>
                        <p><strong>Item:</strong> ${offer.name}</p>
                        <p><strong>Status:</strong> ${offer.status}</p>
                        <p><strong>Quantity:</strong> ${offer.oquantity}</p>
                        <p class="text-red-700">Created on ${formattedDate} at ${formattedTime}</p>
                    `;
                    userOffersElement.appendChild(offerItem);
                });
            } else {
                console.error('Error in the response data:', data.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error fetching user data:', error);
        }
    });
}
