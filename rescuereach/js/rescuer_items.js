document.addEventListener('DOMContentLoaded', function() {
    const logged_user = JSON.parse(localStorage.getItem("logged_user"));
    const user_id = logged_user[0].user_id;

    function fetchItems() {
        $.ajax({
            url: './php/fetch_items.php',
            method: 'POST',
            data: { user_id: user_id },
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    displayBaseItems(data.baseItems);
                    displayCarItems(data.carItems);
                } else {
                    console.error('Error fetching items:', data.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching items:', error);
            }
        });
    }

    function displayBaseItems(items) {
        const baseItemsContainer = document.getElementById('baseItems');
        const searchBar = document.getElementById('searchBar');
    
        // Filter and display items based on search query
        function filterItems() {
            const query = searchBar.value.toLowerCase();
            baseItemsContainer.innerHTML = '';
    
            const filteredItems = items.filter(item => item.name.toLowerCase().includes(query));
    
            if (filteredItems.length === 0) {
                baseItemsContainer.innerHTML = '<p class="text-white">No items found.</p>';
            } else {
                filteredItems.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'item bg-gray-700 p-4 rounded-lg text-white';
                    itemDiv.innerHTML = `
                        <p><strong>Item:</strong> ${item.name}</p>
                        <p><strong>Quantity:</strong> ${item.quantity}</p>
                        <input type="number" min="1" id="load-quantity-${item.id}" class="bg-gray-900 text-white rounded p-2 mb-2" placeholder="Quantity to Load">
                        <button class="load-item-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded" data-item-id="${item.id}">Load to Car</button>
                    `;
    
                    baseItemsContainer.appendChild(itemDiv);
                });
    
                // Add event listeners to load buttons
                document.querySelectorAll('.load-item-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const itemId = this.getAttribute('data-item-id');
                        const loadQuantity = parseInt(document.getElementById(`load-quantity-${itemId}`).value, 10);
                        if (loadQuantity > 0) {
                            loadItemToCar(itemId, loadQuantity);
                        } else {
                            Swal.fire('Error', 'Please enter a valid quantity.', 'error');
                        }
                    });
                });
            }
        }
    
        // Add event listener for search input
        searchBar.addEventListener('input', filterItems);
    
        // Initial display of items
        filterItems();
    }
    

    function displayCarItems(items) {
        const carItemsContainer = document.getElementById('carItems');
        carItemsContainer.innerHTML = '';
        

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item bg-gray-700 p-4 rounded-lg text-white';
            itemDiv.innerHTML = `
                <p><strong>Item:</strong> ${item.name}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <input type="number" min="1" id="unload-quantity-${item.item_id}" class="bg-gray-900 text-white rounded p-2 mb-2" placeholder="Quantity to Unload">
                <button class="unload-item-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded" data-item-id="${item.item_id}">Unload from Car</button>
            `;

            carItemsContainer.appendChild(itemDiv);
        });

        // Add event listeners to unload buttons
        document.querySelectorAll('.unload-item-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-item-id');
                const quantityInput = document.getElementById(`unload-quantity-${itemId}`);
                const unloadQuantity = parseInt(quantityInput.value, 10);
                
                // Check if quantity is not set or is zero
                if (!unloadQuantity) {
                    // Prompt with Swal.fire to confirm unloading all items
                    Swal.fire({
                        title: 'No quantity entered',
                        text: 'Do you want to unload all items?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, unload all',
                        cancelButtonText: 'No, cancel'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // If confirmed, pass a special value to indicate unloading all items
                            unloadItemFromCar(itemId, 1000);
                        }
                    });
                } else {
                    // If quantity is valid, proceed with the unload
                    unloadItemFromCar(itemId, unloadQuantity);
                }
            });
        });
    }
    
    function loadItemToCar(itemId, quantity) {
        $.ajax({
            url: './php/load_item.php',
            method: 'POST',
            data: { user_id: user_id, item_id: itemId, quantity: quantity },
            success: function(response) {
                if (response == 1) {
                    Swal.fire('Success', 'Item loaded to car successfully.', 'success');
                    fetchItems();
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            }
        });
    }

    function unloadItemFromCar(itemId, quantity) {
        $.ajax({
            url: './php/unload_item.php',
            method: 'POST',
            data: { user_id: user_id, item_id: itemId, quantity: quantity },
            success: function(response) {
                if (response == 1) {
                    Swal.fire('Success', 'Item unloaded from car successfully.', 'success');
                    fetchItems();
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            }
        });
    }

    fetchItems();
});
