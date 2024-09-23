<?php
include 'connection.php'; // Include your database connection

$user_id = $_POST['user_id'];
$item_id = $_POST['item_id'];
$new_quantity = $_POST['quantity'];

// Check if the item exists in the car
$carItemQuery = "SELECT * FROM vehicle_cargo WHERE user_id='$user_id' AND item_id='$item_id'";
$carItemResult = mysqli_query($link, $carItemQuery);

if (mysqli_num_rows($carItemResult) > 0) {
    // Update the quantity in vehicle_cargo
    $updateCarItemQuery = "UPDATE vehicle_cargo SET quantity='$new_quantity' WHERE user_id='$user_id' AND item_id='$item_id'";
    if (mysqli_query($link, $updateCarItemQuery)) {
        echo 1; // Success
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update item quantity in car.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Item not found in car.']);
}

mysqli_close($link);
?>
