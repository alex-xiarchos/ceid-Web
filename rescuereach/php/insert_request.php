<?php
include "connection.php";
date_default_timezone_set('Europe/Athens');
$currentDateTime = date('Y-m-d H:i:s');

if (isset($_POST['ids']) && !empty($_POST['ids'])) {
    $items = $_POST['ids'];
    $quantity = $_POST['quantity'];
    $citizen_id = $_POST['citizen_id'];

    // Loop through the items and insert them into the "requests" table
    foreach ($items as $item) {
        $sql = "INSERT INTO requests (citizen_id, item_id, status, created_at, rescuer_assigned, quantity) VALUES ('$citizen_id', '$item', 'pending', '$currentDateTime', NULL, '$quantity')";
        mysqli_query($link, $sql);
    }

    // Return a success response
    echo "Success";
} else {
    // Return an error response if no items are provided
    echo "No items provided";
}
?>
