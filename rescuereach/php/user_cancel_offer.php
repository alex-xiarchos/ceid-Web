<?php
include "connection.php";

$item_id = $_POST['item_id'];
$user_id = $_POST['user_id'];

// Insert the offer into the "offers" table
$sql = "UPDATE offers SET status='cancelled' WHERE item_id='$item_id'";
// Log the query for debugging
error_log("SQL Query: $sql");

$result = mysqli_query($link, $sql);

echo 1;
?>
