<?php
// Start a session
session_start();

// Include the database connection
include "connection.php";

// Initialize the result array
$result = array();

// Get username and password from the POST request
$username = $_POST['username'];
$password = $_POST['password'];

// Query to retrieve user information based on the provided username
$query = mysqli_query($link, "SELECT * FROM users WHERE username='$username'");

// Check if there's a single matching result
if (mysqli_num_rows($query) === 1) {
    // Fetch the row associated with the query result
    $row = mysqli_fetch_assoc($query);
    $isPasswordCorrect = ($password == $row['password']);


    if ($isPasswordCorrect) {
        // Password is correct
        
        // Add user information to the result array
        array_push($result, array('username' => $row['username'], 'user_id' => $row['user_id'], 'user_type' => $row['user_type']));

        // Store user information in session variables
        $_SESSION['user_type'] = $row['user_type'];
        $_SESSION['username'] = $row['username'];
        $_SESSION['user_id'] = $row['user_id'];

        setcookie('user_type', $row['user_type'], time() + (86400 * 30), "/"); // 30 days
        // Encode and output the result as JSON
        echo json_encode($result, true);
        
    } else {
        // Password is incorrect
        echo 2;
    }

    // Exit the script
    exit();
} else {
    // No matching result found for the username
    echo 2;
    exit();
}
?>
