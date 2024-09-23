<?php
include 'connection.php';

// Get POST data
$product_id = $_POST['productId'];
$product_name = $_POST['name'];
$product_quantity = $_POST['quantity'];

// Validate POST data
if (empty($product_id) || empty($product_name) || empty($product_quantity)) {
    echo json_encode(["error" => "All fields are required."]);
    exit();
}

// Update product info
$sql = "UPDATE items SET name='$product_name', quantity='$product_quantity' WHERE id='$product_id'";

if (mysqli_query($link, $sql)) {
    echo 1;
} else {
    echo 0;
}

mysqli_close($link);
?>
