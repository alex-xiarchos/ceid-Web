<?php
include 'connection.php';

// Get POST data
$task_id = $_POST['task_id'];
$task_type = $_POST['task_type'];
$user_id = $_POST['user_id'];

// Check if the rescuer already has 4 tasks
$query = "
    SELECT COUNT(*) as task_count 
    FROM (
        SELECT id FROM requests WHERE rescuer_assigned='$user_id' AND status='accepted'
        UNION ALL
        SELECT id FROM offers WHERE rescuer_assigned='$user_id' AND status='accepted'
    ) as tasks";

$result = mysqli_query($link, $query);
$row = mysqli_fetch_assoc($result);

if ($row['task_count'] >= 4) {
    echo 4;
    exit();
}

// Determine the table and set the query based on task type
if ($task_type == 'request') {
    $query = "UPDATE requests SET status='accepted', rescuer_assigned='$user_id' WHERE id='$task_id'";
} elseif ($task_type == 'offer') {
    $query = "UPDATE offers SET status='accepted', rescuer_assigned='$user_id' WHERE id='$task_id'";
} else {
    echo 0;
    exit();
}

// Execute the query and return the result
if (mysqli_query($link, $query)) {
    echo 1;
} else {
    echo 0;
}

mysqli_close($link);
?>
