<?php
include "connection.php"; // Include your database connection

if (isset($_POST['ids']) && !empty($_POST['ids'])) {
    $items = $_POST['ids'];
    $quantity = $_POST['quantity'];

    // Loop through the items and insert them into the "announcement" table
    foreach ($items as $item) {
        $sql = "INSERT INTO announcement (id, quantity) VALUES ('$item', '$quantity')";
        mysqli_query($link, $sql);
    }

    // Return a success response
    echo 1;
} else {
    // Return an error response if no items are provided
    echo "No items provided";
}
?>