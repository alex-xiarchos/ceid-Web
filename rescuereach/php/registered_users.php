<?php
include "connection.php"; // Include your database connection script

// Prepare the SQL statement to select username, name, and user_type fields
$sql = "SELECT users.username, users.name, users.user_type, GROUP_CONCAT(CONCAT(items.name, ' (', vehicle_cargo.quantity, ')') SEPARATOR ', ') AS cargo_items 
        FROM users LEFT JOIN vehicle_cargo ON users.user_id = vehicle_cargo.user_id LEFT JOIN items ON vehicle_cargo.item_id = items.id WHERE users.user_type IN 
        ('r', 'c') GROUP BY users.user_id, users.username, users.name, users.user_type";

// Execute the query
$result = mysqli_query($link, $sql);

// Check for errors in the SQL execution
if (!$result) {
    echo json_encode(['error' => mysqli_error($link)]);
    exit;
}

// Fetch all rows as an associative array
$registered_users = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Set header to return JSON
header('Content-Type: application/json');

// Echo the user roles as a JSON string
echo json_encode($registered_users);

mysqli_close($link);
?>
