<?php
include "connection.php"; // Include your database connection

$userId = $_GET['user_id'];

// Fetch announcements along with a flag indicating whether an offer exists for each item
$announcementSql = "SELECT announcement_id AS an_id, items.id, items.name, announcement.quantity, EXISTS (SELECT 1 FROM offers WHERE offers.item_id = items.id AND offers.citizen_id = $userId AND offers.status='pending' AND offers.quantity = announcement.quantity) 
                    AS offerExists FROM items INNER JOIN announcement ON items.id = announcement.id";

$announcementResult = mysqli_query($link, $announcementSql);

if (!$announcementResult) {
    echo json_encode(['error' => mysqli_error($link)]);
    exit;
}

$announcements = mysqli_fetch_all($announcementResult, MYSQLI_ASSOC);

// Return announcements as a JSON object
$response = array(
    'announcements' => $announcements
);

header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($link);
?>
