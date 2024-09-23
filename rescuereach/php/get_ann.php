<?php
include "connection.php";

$sql = "SELECT announcement.announcement_id, announcement.quantity, items.name AS item_name
        FROM announcement
        JOIN items ON announcement.id = items.id";

$result = $link->query($sql);

if (!$result) {
    // SQL query failed, display the error
    die("Query failed: " . $link->error);
}

$announcements = [];

if ($result->num_rows > 0) {
    // Fetch each row as an associative array
    while($row = $result->fetch_assoc()) {
        $announcements[] = $row;
    }
} else {
    // No records found
    $announcements[] = ["message" => "No announcements found."];
}

// Close the database linkection
$link->close();

// Return the results as JSON
header('Content-Type: application/json');
echo json_encode($announcements);
?>