$(document).ready(function () {
    // Fetch categories and products on page load
    $.ajax({
        url: "./php/item_categories.php",
        method: "GET",
        dataType: "json",
        success: function (response) {
            updateProductGrid(Object.values(response["products"]));
  
            // Initialize categories dropdown for product filter
            $("#categories").empty(); // Clear any existing options
            let option = document.createElement("option");
            option.textContent = "all categories";
            $("#categories").append(option);
            response["categories"].forEach((category) => {
                option = document.createElement("option");
                option.textContent = category;
                $("#categories").append(option);
            });
  
            // Populate categories in the add product modal
            const categoriesDropdown = $("#modal-addProduct-category");
            categoriesDropdown.empty(); // Clear any existing options
            response["categories"].forEach((category) => {
                const option = new Option(category, category);
                categoriesDropdown.append(option);
            });
        },
        error: function () {
            Swal.fire("Error", "Could not get products from database. Try again later", "error");
        }
    });
  
    $("#add-product-btn").on("click", () => {
        $("#add-product-modal").removeClass("hidden");
    });
  
    $("#cancel-modal-btn").on("click", () => {
        $("#add-product-modal").addClass("hidden");
    });
  
    $("#cancel-product-modal-btn").on("click", () => {
        $("#product-modal").addClass("hidden");
    });

    // ADD AN ITEM button
    $("#insert-product-btn").on("click", (event) => {
        const productName = $("#modal-addProduct-title").val();
        const productCategory = $("#modal-addProduct-category").val();
        const productBaseQuantity = $("#modal-addProduct-baseQuantity").val();
  
        // Check if fields are empty
        if (productName === "" || productCategory === "" || productBaseQuantity === "") {
            Swal.fire("Error", "You have to insert all values to insert a new product", "error");
            return;
        }
  
        // Check if quantity is an integer
        if (!parseInt(productBaseQuantity) || productBaseQuantity < 1) {
            Swal.fire("Error", "Base Quantity has to be a positive integer", "error");
            return;
        }
  
        Swal.fire({
            title: 'Confirmation',
            text: 'Are you sure you want to add this product?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                const data = { name: productName, category: productCategory, baseQuantity: productBaseQuantity };
                $.ajax({
                    url: "./php/insert_product.php",
                    method: "POST",
                    data: data,
                    success: function (response) {
                        onProductInsertedSuccess();
                        $("#add-product-modal").addClass("hidden");
                    },
                    error: function () {
                        Swal.fire("Error", "Product could not be inserted", "error");
                    }
                });
            }
        });
    });
  
    // After a product is added, erase forms and update grid
    function onProductInsertedSuccess() {
        Swal.fire("Success", "Product inserted successfully", "success");
  
        // Make input values empty
        $("#modal-addProduct-title").val("");
        $("#modal-addProduct-category").val("");
        $("#modal-addProduct-baseQuantity").val("");
  
        // Update product grid after product inserted
        $.ajax({
            url: "./php/item_categories.php",
            method: "GET",
            dataType: "json",
            success: function (response) {
                updateProductGrid(Object.values(response["products"]));
            },
            error: function () {
                Swal.fire("Error", "Could not get products from database. Try again later", "error");
            }
        });
    }
  
    // FILTER products by category functionality
    $("#categories").change(() => {
        let url = "./php/item_categories.php";
        if ($("#categories").find(":selected").text() !== "all categories") {
            url += `?category=${$("#categories").find(":selected").text()}`;
        }
        $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            success: function (response) {
                updateProductGrid(Object.values(response["products"]));
            },
            error: function () {
                console.log(error);
                Swal.fire("Error", "Could not get products from database. Try again later", "error");
            }
        });
    });
  
    // Initialize autocomplete search functionality
    $("#autocomplete").keyup(() => {
        // When a key is clicked change the product grid
        $.ajax({
            url: `./php/item_categories.php?productName=${$("#autocomplete").val()}`,
            method: "GET",
            dataType: "json",
            success: function (response) {
                updateProductGrid(Object.values(response["products"]));
            },
            error: function () {
                console.log(error);
                Swal.fire("Error", "Could not get products from database. Try again later", "error");
            }
        });
    });
  
    // Populate grid with items
    function updateProductGrid(products) {
        const productGridDiv = document.getElementsByClassName("product-grid")[0];
        // Clear all existing products from the grid
        while (productGridDiv.firstChild) {
            productGridDiv.removeChild(productGridDiv.firstChild);
        }

        products.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("product-card", "bg-custom-prim", "text-white", "p-4", "rounded-lg", "shadow-md", "space-y-2", "flex", "flex-col", "items-start", "hover:bg-gray-300");
        
            // Product title
            const productTitleDiv = document.createElement("div");
            productTitleDiv.classList.add("product-title", "font-bold", "text-lg");
            productTitleDiv.innerText = product.name;
            productDiv.appendChild(productTitleDiv);
        
            // Product category
            const productCategoryDiv = document.createElement("div");
            productCategoryDiv.classList.add("product-category", "text-sm", "text-gray-400");
            productCategoryDiv.innerText = product.category;
            productDiv.appendChild(productCategoryDiv);
        
            // Tooltip for EDIT
            const tooltip = document.createElement("div");
            tooltip.classList.add("tooltip");
            tooltip.innerText = "Edit";
            productDiv.appendChild(tooltip);
        
            // Event to handle mouse enter and leave for custom effects
            productDiv.addEventListener('mouseenter', () => {
                productTitleDiv.classList.add('cstm');
                productCategoryDiv.classList.add('cstm');
            });
        
            productDiv.addEventListener('mouseleave', () => {
                productTitleDiv.classList.remove('cstm');
                productCategoryDiv.classList.remove('cstm');
            });
        
            // Edit product event
            tooltip.addEventListener("click", (event) => {
                event.stopPropagation(); 
                $.ajax({
                    url: `./php/product_info.php?id=${product.id}`,
                    method: "GET",
                    dataType: "json",
                    success: (response) => {
                        onProductFound(response, productDiv);
                    },
                    error: () => {
                        Swal.fire("Error", "Could not load Product", "error");
                    }
                });
            });
        
            // Delete button
            const deleteProductBtn = document.createElement("button");
            deleteProductBtn.classList.add("hover:bg-red-600", "py-1", "px-2", "rounded-full", "self-end");
        
            const deleteIcon = document.createElement("img");
            deleteIcon.src = "./remove.png";
            deleteIcon.alt = "Remove";
            deleteIcon.classList.add("w-4", "h-4");
        
            deleteProductBtn.appendChild(deleteIcon);
            productDiv.appendChild(deleteProductBtn);
        
            // Delete product event
            deleteProductBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                Swal.fire({
                    title: 'Confirmation',
                    text: 'Are you sure you want to delete this product?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then((result) => {
                    if (result.isConfirmed) {
                        $.ajax({
                            url: "./php/delete_product.php",
                            method: "POST",
                            data: { productId: product.id },
                            success: (response) => {
                                if (response == 1) {
                                    Swal.fire("Success", "Product deleted successfully", "success");
                                    productDiv.remove();
                                } else {
                                    Swal.fire("Error", "Product could not be deleted", "error");
                                }
                            },
                            error: () => {
                                Swal.fire("Error", "Product could not be deleted", "error");
                            }
                        });
                    }
                });
            });
        
            productGridDiv.appendChild(productDiv); // Append the created productDiv to the grid
        });
    }
    
    // EDIT product modal 
    function onProductFound(response, productDiv) {
      const modalProductTitle = document.getElementById("modal-product-title");
      const modalProductBaseQuantity = document.getElementById("modal-product-baseQuantity");
      // Update modal fields
      modalProductTitle.value = response.name;
      modalProductBaseQuantity.value = response.quantity;

      // Show the modal
      $("#product-modal").removeClass("hidden");
  
      // Update product info
      const applyBtn = document.getElementById("apply-btn");
      applyBtn.onclick = () => {
          const updatedName = modalProductTitle.value;
          const updatedQuantity = modalProductBaseQuantity.value;

          if (!parseInt(updatedQuantity) || updatedQuantity < 1) {
            Swal.fire("Error", "Updated quantity has to be a positive integer", "error");
            return;
          } 

          $.ajax({
            url: "./php/update_product.php",
            method: "POST",
            data: {
                name: updatedName,
                quantity: updatedQuantity,
                productId: response.id,
            },
            success: function(response) {
                if (response === 1) {
                    Swal.fire("Success", "Product updated successfully", "success");
                    $("#product-modal").addClass("hidden");
                    productDiv.querySelector('.product-title').innerText = updatedName;
                    productDiv.querySelector('.product-quantity').innerText = updatedQuantity;
                } else {
                    Swal.fire("Error", "Could not update Product. Please try again later", "error");
                }
            },
            error: function() {
                Swal.fire("Error", "An error occurred. Please try again later", "error");
            }
        });
      };
  }
  
  });