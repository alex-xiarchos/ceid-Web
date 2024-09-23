<?php
include 'connection.php'; // Include your database connection

$user_id = $_POST['user_id'];
$item_id = $_POST['item_id'];
$load_quantity = $_POST['quantity'];

// Check if the item exists in the base
$baseItemQuery = "SELECT * FROM items WHERE id='$item_id'";
$baseItemResult = mysqli_query($link, $baseItemQuery);
$baseItem = mysqli_fetch_assoc($baseItemResult);


if ($baseItem['quantity'] < $load_quantity) {
    echo json_encode(['success' => false, 'message' => 'Not enough items in the base.']);
    mysqli_close($link);
    exit();
}

// Check if the item already exists in the vehicle_cargo for the user
$carItemQuery = "SELECT * FROM vehicle_cargo WHERE item_id='$item_id' AND user_id='$user_id'";
$carItemResult = mysqli_query($link, $carItemQuery);
$carItem = mysqli_fetch_assoc($carItemResult);

if ($carItem) {
    // Update the quantity in vehicle_cargo if item already exists
    $newQuantity = $carItem['quantity'] + $load_quantity;
    $updateCarItemQuery = "UPDATE vehicle_cargo SET quantity='$newQuantity' WHERE item_id='$item_id' AND user_id='$user_id'";
    $updateResult = mysqli_query($link, $updateCarItemQuery);
} else {
    // Insert new item into vehicle_cargo if it doesn't exist
    $insertCarItemQuery = "INSERT INTO vehicle_cargo (user_id, item_id, quantity) VALUES ('$user_id', '$item_id', '$load_quantity')";
    $insertResult = mysqli_query($link, $insertCarItemQuery);
}

// Update the base item quantity
$newBaseQuantity = $baseItem['quantity'] - $load_quantity;
$updateBaseItemQuery = "UPDATE items SET quantity='$newBaseQuantity' WHERE id='$item_id'";
$updateResult = mysqli_query($link, $updateBaseItemQuery);

if ($updateResult) {
    echo 1;
} else {
    echo 0;
}

mysqli_close($link);
?>
