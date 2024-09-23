<?php
include 'connection.php'; // Include your database connection

// Get POST data
$user_id = $_POST['user_id'];
$username = $_POST['username'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$password = $_POST['password'];

// Update user information
$query = "UPDATE users SET username='$username', email='$email', phone='$phone', password='$password' WHERE user_id='$user_id'";
$result = mysqli_query($link, $query);

if ($result) {
    echo 1;
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update user information.']);
}

mysqli_close($link);
?>
