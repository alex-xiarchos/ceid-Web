<?php
session_start();
include "connection.php"; // Database connection

$latitude = $_POST['latitude'];
$longitude = $_POST['longitude'];

// Updating the base location
$query = "UPDATE base SET latitude = '$latitude', longitude = '$longitude'";
$result = mysqli_query($link, $query);

if ($result) {
    echo json_encode("Base location updated successfully");
} else {
    echo json_encode("Error updating base location");
}

mysqli_close($link);
?>
