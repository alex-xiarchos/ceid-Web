<?php
include "connection.php";
date_default_timezone_set('Europe/Athens');
$currentDateTime = date('Y-m-d H:i:s');

$item_id = $_POST['item_id'];
$quantity = $_POST['quantity'];
$user_id = $_POST['user_id'];

// Insert the offer into the "offers" table
$sql = "INSERT INTO offers (citizen_id, item_id, status, created_at, rescuer_assigned, quantity) VALUES ('$user_id', '$item_id', 'pending', '$currentDateTime', NULL, '$quantity')";
// Log the query for debugging
error_log("SQL Query: $sql");

$result = mysqli_query($link, $sql);

echo 1;
?>
