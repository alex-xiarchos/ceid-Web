document.addEventListener('DOMContentLoaded', function() {
    $("#open-modal-btn").on("click", () => {
        $("#upload-modal").removeClass("hidden");
    });

    // Hide the Upload Modal
    $("#cancel-upload-btn").on("click", () => {
        $("#upload-modal").addClass("hidden");
    });

    // Handle the upload button click
    document.getElementById('upload-btn').addEventListener('click', function() {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
    
            reader.onload = function(e) {
                const uploadedData = JSON.parse(e.target.result);
                
                // Log data before sending to check structure
                console.log(uploadedData);
    
                if (Array.isArray(uploadedData)) {
                    $.ajax({
                        url: 'php/upload.php',
                        type: 'POST',
                        data: JSON.stringify({ items: uploadedData }), // Ensure data is sent as JSON
                        contentType: 'application/json', // Set content type to JSON
                        success: function(response) {
                            Swal.fire('Success', 'Items uploaded and updated successfully!', 'success').then(() => {
                                window.location.reload();
                            });
                        }
                    });
                } else {
                    Swal.fire('Error', 'Invalid JSON format!', 'error');
                }
            
            };
    
            reader.readAsText(file);
        } else {
            Swal.fire('Error', 'No file selected!', 'error');
        }
    });
});
