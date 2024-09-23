<?php
include 'connection.php'; // Include your database connection

$user_id = $_POST['user_id'];

// Fetch all items in the base
$baseItemsQuery = "SELECT id, name, quantity FROM items";
$baseItemsResult = mysqli_query($link, $baseItemsQuery);
$baseItems = array();

while ($row = mysqli_fetch_assoc($baseItemsResult)) {
    $baseItems[] = $row;
}

// Fetch items in the rescuer's car from vehicle_cargo
$carItemsQuery = "
    SELECT items.id AS item_id, items.name, vehicle_cargo.quantity 
    FROM items 
    JOIN vehicle_cargo ON items.id = vehicle_cargo.item_id 
    WHERE vehicle_cargo.user_id = '$user_id'";
$carItemsResult = mysqli_query($link, $carItemsQuery);
$carItems = array();

while ($row = mysqli_fetch_assoc($carItemsResult)) {
    $carItems[] = $row;
}

// Return the results as a JSON object
$response = array(
    'success' => true,
    'baseItems' => $baseItems,
    'carItems' => $carItems
);

header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($link);
?>
