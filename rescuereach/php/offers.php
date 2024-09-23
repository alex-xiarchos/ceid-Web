<?php
include "connection.php"; // Your database connection file

// Query to get offers
$query = "SELECT 
    o.id, 
    u.latitude, 
    u.longitude, 
    u.name, 
    u.phone, 
    o.created_at, 
    o.status, 
    u2.user_id AS assigned_id, 
    u2.name AS assigned_name, 
    u2.phone AS assigned_phone,
    i.name AS item_name, 
    o.quantity AS item_quantity
FROM 
    offers o 
JOIN 
    users u ON o.citizen_id = u.user_id 
LEFT JOIN 
    users u2 ON o.rescuer_assigned = u2.user_id 
LEFT JOIN 
    items i ON o.item_id = i.id 
WHERE  
    o.status IN ('pending', 'accepted', 'completed')
          ";
$result = mysqli_query($link, $query);

$offers = array();
while ($row = mysqli_fetch_assoc($result)) {
    $offers[] = $row;
}

echo json_encode($offers);

mysqli_close($link);
?>
