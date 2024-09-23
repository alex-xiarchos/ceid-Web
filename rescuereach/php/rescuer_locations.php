<?php
include "connection.php"; // Your database connection file

$rescuers = array();

// Query to get rescuers
$query_rescuers = "SELECT user_id, name, phone, latitude, longitude FROM users WHERE user_type = 'r'";
$result_rescuers = mysqli_query($link, $query_rescuers);

while ($row = mysqli_fetch_assoc($result_rescuers)) {
    $rescuer_id = $row['user_id'];
    
    // Fetch assigned offers
    $query_offers = "
        SELECT u.latitude, u.longitude 
        FROM offers o 
        INNER JOIN users u ON o.citizen_id = u.user_id 
        WHERE o.rescuer_assigned = $rescuer_id";
    $result_offers = mysqli_query($link, $query_offers);
    $offers = array();
    while ($offer = mysqli_fetch_assoc($result_offers)) {
        $offers[] = $offer;
    }
    
    // Fetch assigned requests
    $query_requests = "
        SELECT u.latitude, u.longitude 
        FROM requests r 
        INNER JOIN users u ON r.citizen_id = u.user_id 
        WHERE r.rescuer_assigned = $rescuer_id";
    $result_requests = mysqli_query($link, $query_requests);
    $requests = array();
    while ($request = mysqli_fetch_assoc($result_requests)) {
        $requests[] = $request;
    }

    // Fetch cargo items for the rescuer
    $query_cargo = "
        SELECT vc.item_id, i.name, vc.quantity 
        FROM vehicle_cargo vc 
        INNER JOIN items i ON vc.item_id = i.id 
        WHERE vc.user_id = $rescuer_id";
    $result_cargo = mysqli_query($link, $query_cargo);
    $cargo = array();
    while ($cargo_item = mysqli_fetch_assoc($result_cargo)) {
        $cargo[] = $cargo_item;
    }
    
    // Add offers, requests, and cargo to the rescuer data
    $row['offers'] = $offers;
    $row['requests'] = $requests;
    $row['cargo'] = $cargo;

    $rescuers[] = $row;
}

echo json_encode($rescuers);

mysqli_close($link);
?>