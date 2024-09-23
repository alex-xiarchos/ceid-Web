<?php
include 'connection.php';

// Get POST data
$request_id = $_POST['task_id'];

// Update product info
$query = "UPDATE requests SET status='pending', rescuer_assigned=NULL WHERE id='$request_id'";

if (mysqli_query($link, $query)) {
    echo 1;
} else {
    echo 0;
}

mysqli_close($link);
?>
