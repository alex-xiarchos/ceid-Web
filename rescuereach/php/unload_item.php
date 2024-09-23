<?php
include 'connection.php'; // Include your database connection

$user_id = $_POST['user_id'];
$item_id = $_POST['item_id'];
$unload_quantity = $_POST['quantity'];

// Check if the item exists in the car
$carItemQuery = "SELECT * FROM vehicle_cargo WHERE user_id='$user_id' AND item_id='$item_id'";
$carItemResult = mysqli_query($link, $carItemQuery);
$carItem = mysqli_fetch_assoc($carItemResult);

if (!$carItem) {
    echo json_encode(['success' => false, 'message' => 'Item not found in car.']);
    mysqli_close($link);
    exit();
}
 //  if no quantity is passed (q=1000) it means unload all
if ($unload_quantity == 1000) {
    $unload_quantity = $carItem['quantity']; // Set to the full quantity in the vehicle
}


if ($carItem['quantity'] < $unload_quantity) {
    echo json_encode(['success' => false, 'message' => 'Not enough items in the car.']);
    mysqli_close($link);
    exit();
}

// Check if the item already exists in the base
$baseItemQuery = "SELECT * FROM items WHERE id='$item_id'";
$baseItemResult = mysqli_query($link, $baseItemQuery);
$baseItem = mysqli_fetch_assoc($baseItemResult);

$newBaseQuantity = $baseItem['quantity'] + $unload_quantity;
$updateBaseItemQuery = "UPDATE items SET quantity='$newBaseQuantity' WHERE id='$item_id'";
$updateResult = mysqli_query($link, $updateBaseItemQuery);

// Update or delete the item from vehicle_cargo
if ($carItem['quantity'] == $unload_quantity) {
    $deleteCarItemQuery = "DELETE FROM vehicle_cargo WHERE user_id='$user_id' AND item_id='$item_id'";
    $deleteResult = mysqli_query($link, $deleteCarItemQuery);
} else {
    $newCarQuantity = $carItem['quantity'] - $unload_quantity;
    $updateCarItemQuery = "UPDATE vehicle_cargo SET quantity='$newCarQuantity' WHERE user_id='$user_id' AND item_id='$item_id'";
    $updateResult = mysqli_query($link, $updateCarItemQuery);
}

if ($updateResult || isset($deleteResult) && $deleteResult) {
    echo 1;
} else {
    echo 0;
}

mysqli_close($link);
?>
