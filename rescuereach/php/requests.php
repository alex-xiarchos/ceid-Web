<?php
include "connection.php"; // Your database connection file

// Query to get offers
$query = "SELECT 
    r.id, 
    u.latitude, 
    u.longitude, 
    u.name, 
    u.phone, 
    r.created_at, 
    r.status, 
    u2.user_id AS assigned_id, 
    u2.name AS assigned_name, 
    u2.phone AS assigned_phone,
    i.name AS item_name, 
    r.quantity AS item_quantity
FROM 
    requests r 
JOIN 
    users u ON r.citizen_id = u.user_id 
LEFT JOIN 
    users u2 ON r.rescuer_assigned = u2.user_id 
LEFT JOIN 
    items i ON r.item_id = i.id 
WHERE  
    r.status IN ('pending', 'accepted', 'completed')
          ";
$result = mysqli_query($link, $query);

$offers = array();
while ($row = mysqli_fetch_assoc($result)) {
    $offers[] = $row;
}

echo json_encode($offers);

mysqli_close($link);
?>
