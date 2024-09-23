<?php
include "connection.php"; // Include your database connection

header('Content-Type: application/json'); // Ensure the response is in JSON format

$user = $_POST['user'];
$pass = $_POST['pass'];
$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$location = $_POST['location'];



// Split the location into latitude and longitude
list($latitude, $longitude) = explode(', ', $location);

// Insert the user into the database using mysqli_query
$query = "INSERT INTO users (user_type, username, password, email, name, phone, latitude, longitude) 
            VALUES ('c', '$user', '$pass', '$email', '$name', '$phone', '$latitude', '$longitude')";

if (mysqli_query($link, $query)) {
    echo "ok";
} else {
    $error_message = 'Error registering user: ' . mysqli_error($link);
    error_log($error_message); // Log the error for debugging
    echo "error";
}

mysqli_close($link);
?>
