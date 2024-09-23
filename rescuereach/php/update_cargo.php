<?php
include 'connection.php'; // Include your database connection

$offer_id = $_POST['offer_id'];
$user_id = $_POST['user_id'];

// Fetch the offer details including the quantity
$offerQuery = "SELECT * FROM offers WHERE id='$offer_id'";
$offerResult = mysqli_query($link, $offerQuery);

$offer = mysqli_fetch_assoc($offerResult);
$item_id = $offer['item_id'];
$quantity = $offer['quantity'];

// Check if the item exists in the vehicle_cargo for the user
$carItemQuery = "SELECT * FROM vehicle_cargo WHERE item_id='$item_id' AND user_id='$user_id'";
$carItemResult = mysqli_query($link, $carItemQuery);

if ($carItem = mysqli_fetch_assoc($carItemResult)) {
    // Update the quantity in vehicle_cargo if the item already exists
    $newQuantity = $carItem['quantity'] + $quantity;
    $updateCarItemQuery = "UPDATE vehicle_cargo SET quantity='$newQuantity' WHERE item_id='$item_id' AND user_id='$user_id'";
    $updateResult = mysqli_query($link, $updateCarItemQuery);
} else {
    // Insert a new item into vehicle_cargo if it doesn't exist
    $insertCarItemQuery = "INSERT INTO vehicle_cargo (user_id, item_id, quantity) VALUES ('$user_id', '$item_id', '$quantity')";
    $updateResult = mysqli_query($link, $insertCarItemQuery);
}

// Check if the vehicle cargo update was successful
if ($updateResult) {
    echo json_encode(['success' => true, 'message' => 'Cargo updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update cargo.']);
}

mysqli_close($link);
?>
