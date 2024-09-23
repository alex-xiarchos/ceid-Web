<?php
include 'connection.php'; // Include your database connection

$user_id = $_GET['user_id']; // Get the user ID from the GET request

// Prepare the query to fetch user information
$query = "SELECT username, email, phone FROM users WHERE user_id = $user_id";
$result = mysqli_query($link, $query);

if ($result && mysqli_num_rows($result) > 0) {
    $user_data = mysqli_fetch_assoc($result);
    echo json_encode(['success' => true, 'data' => $user_data]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

mysqli_close($link);
?>
