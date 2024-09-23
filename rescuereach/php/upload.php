<?php
include 'connection.php';

// Get the JSON data from the POST request
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (isset($data['items']) && is_array($data['items'])) {
    foreach ($data['items'] as $item) {
        $id = $link->real_escape_string($item['id']); 
        $category_id = $link->real_escape_string($item['category_id']);
        $name = $link->real_escape_string($item['name']);
        $quantity = $link->real_escape_string($item['quantity']);

        // Check if the item already exists
        $check_query = "SELECT * FROM items WHERE id = '$id'";
        $result = mysqli_query($link, $check_query);

        if (mysqli_num_rows($result) > 0) {
            // Update existing item
            $update_query = "UPDATE items SET category_id='$category_id', name='$name', quantity='$quantity' WHERE id='$id'";
            mysqli_query($link, $update_query);
        } else {
            // Insert new item
            $insert_query = "INSERT INTO items (id, category_id, name, quantity) VALUES ('$id', '$category_id', '$name', '$quantity')";
            mysqli_query($link, $insert_query);
        }
    }

    echo json_encode(['status' => 'success', 'message' => 'Items uploaded and updated successfully!']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data format!']);
}

// Close the database connection
$link->close();
?>
