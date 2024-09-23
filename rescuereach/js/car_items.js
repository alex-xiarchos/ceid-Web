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

    function displayCarItems(items) {
        const carItemsContainer = document.getElementById('carItems');
        carItemsContainer.innerHTML = '';
        console.log(items);
        items.forEach(item => {
            if (item.quantity > 0) {
                const itemDiv = document.createElement('div');
            itemDiv.className = 'item bg-gray-700 p-4 rounded-lg text-white relative';
            itemDiv.innerHTML = `
                <p><strong>Item:</strong> ${item.name}</p>
                <p class="quantity" data-item-id="${item.item_id}">
                    <strong class="quant">Quantity:</strong> 
                    <span class="quantity-value">${item.quantity}</span>
                </p>
            `;

            carItemsContainer.appendChild(itemDiv);
            }
        });
        // Add click event listeners to quantities for editing
        document.querySelectorAll('.quantity').forEach(quantityElement => {
            quantityElement.addEventListener('click', function() {
                const itemId = this.getAttribute('data-item-id');
                const quantitySpan = this.querySelector('.quantity-value');
                const currentQuantity = quantitySpan.textContent;

                // Open modal for editing quantity
                openEditModal(itemId, currentQuantity);
            });
        });
    }

    function openEditModal(itemId, currentQuantity) {
        const modal = document.getElementById('editQuantityModal');
        const quantityInput = document.getElementById('editQuantityInput');
        const saveButton = document.getElementById('saveQuantityButton');

        quantityInput.value = currentQuantity;
        modal.style.display = 'block';

        saveButton.onclick = function() {
            const newQuantity = quantityInput.value;
            if (newQuantity !== null && !isNaN(newQuantity) && newQuantity >= 0) {
                updateItemQuantity(itemId, newQuantity);
                modal.style.display = 'none';
            } else {
                Swal.fire('Error', 'Please enter a valid quantity.', 'error');
            }
        };
    }

    function updateItemQuantity(itemId, quantity) {
        $.ajax({
            url: './php/update_quantity.php',
            method: 'POST',
            data: { user_id: user_id, item_id: itemId, quantity: quantity },
            success: function(response) {
                if (response == 1) {
                    Swal.fire('Success', 'Item quantity updated successfully.', 'success');
                    fetchItems();
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            }
        });
    }

    fetchItems();
});
