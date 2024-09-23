<?php
include 'connection.php';

// Get POST data
$offer_id = $_POST['task_id'];

// Update product info
$query = "UPDATE offers SET status='completed' WHERE id='$offer_id'";

if (mysqli_query($link, $query)) {
    echo 1;
} else {
    echo 0;
}

mysqli_close($link);
?>
