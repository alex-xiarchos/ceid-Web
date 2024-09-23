<?php
session_start();
include "connection.php"; 

// Get input data from the POST request
$username = $_POST['username'];
$email = $_POST['email'];
$password = $_POST['password'];
$name = $_POST['name']; 
$phone = $_POST['phone']; 


// Check if the provided username or email already exists in the database
$result1 = mysqli_query($link, "SELECT * FROM users WHERE username='$username'");
$result2 = mysqli_query($link, "SELECT * FROM users WHERE email='$email'");

// Username already in use
if (mysqli_num_rows($result1) > 0) {
    echo 0;
    exit();
}
// Email already registered
elseif (mysqli_num_rows($result2) > 0) {
    echo 1;
    exit();
} else {
    // Insert new user into the database
    $query = "INSERT INTO users(user_type, username, password, email, name, phone) VALUES('r','$username', '$password', '$email', '$name', '$phone')";
    $result3 = mysqli_query($link, $query);

    if ($result3) {
        echo 2; // Successful registration
    } else {
        // Output MySQL error if insertion fails
        echo "Error: " . mysqli_error($link);
    }
}

