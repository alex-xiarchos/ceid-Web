<?php
session_start();
include "connection.php"; // Database connection

$userId = $_SESSION['user_id'];

$query = "SELECT latitude, longitude FROM users WHERE user_id = '$userId'";


$result = mysqli_query($link, $query);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode($row);
} else {
    echo json_encode(['error' => 'No location data found']);
}

mysqli_close($link);
?>
