<?php
session_start();
include "connection.php"; // Database connection

$userId = $_SESSION['user_id'];
$latitude = $_POST['latitude'];
$longitude = $_POST['longitude'];

$query = "UPDATE users SET latitude = '$latitude', longitude = '$longitude' WHERE user_id = '$userId'";
$result = mysqli_query($link, $query);

if ($result) {
    echo json_encode("Location updated successfully");
} else {
    echo json_encode("Error updating location");
}
?>
