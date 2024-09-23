<?php
include "connection.php"; // Your database connection file

$rescuers = array();

if (isset($_GET['user_id'])) {
    $user_id = intval($_GET['user_id']); // Sanitize the input

    // Query to get rescuer
    $query_rescuers = "SELECT user_id, name, phone, latitude, longitude FROM users WHERE user_type = 'r' AND user_id = $user_id";
    $result_rescuers = mysqli_query($link, $query_rescuers);

    while ($row = mysqli_fetch_assoc($result_rescuers)) {
        $rescuer_id = $row['user_id'];
        
        // Fetch assigned offers
        $query_offers = "
            SELECT o.*, i.name AS item_name, u.*
            FROM offers o
            INNER JOIN users u ON o.citizen_id = u.user_id
            INNER JOIN items i ON o.item_id = i.id
            WHERE o.rescuer_assigned = $rescuer_id";
        $result_offers = mysqli_query($link, $query_offers);
        $offers = array();
        while ($offer = mysqli_fetch_assoc($result_offers)) {
            $offers[] = $offer;
        }
        
        // Fetch assigned requests
        $query_requests = "
            SELECT r.*, i.name AS item_name, u.* 
            FROM requests r 
            INNER JOIN users u ON r.citizen_id = u.user_id 
            INNER JOIN items i ON r.item_id = i.id
            WHERE r.rescuer_assigned = $rescuer_id";
        $result_requests = mysqli_query($link, $query_requests);
        $requests = array();
        while ($request = mysqli_fetch_assoc($result_requests)) {
            $requests[] = $request;
        }
        
        $row['offers'] = $offers;
        $row['requests'] = $requests;
        
        $rescuers[] = $row;
    }
}

echo json_encode($rescuers);

mysqli_close($link);
?>
