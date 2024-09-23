<?php
include "connection.php"; // Include your database connection

// Query to get the distinct count of active vehicles from both offers and requests
$activeVehiclesQuery = "SELECT COUNT(DISTINCT rescuer_assigned) as activeVehicles FROM (
                        SELECT rescuer_assigned FROM offers WHERE rescuer_assigned IS NOT NULL UNION
                        SELECT rescuer_assigned FROM requests WHERE rescuer_assigned IS NOT NULL) AS combinedRescuers";

$totalVehiclesQuery = "SELECT COUNT(*) as totalVehicles FROM users WHERE user_type = 'r'";

$result1 = mysqli_query($link, $activeVehiclesQuery);
$result2 = mysqli_query($link, $totalVehiclesQuery);

$activeVehicles = 0;
$totalVehicles = 0;

if ($result1 && $result2) {
    $row1 = mysqli_fetch_assoc($result1);
    $row2 = mysqli_fetch_assoc($result2);

    // Cast results to integers
    $activeVehicles = isset($row1['activeVehicles']) ? (int)$row1['activeVehicles'] : 0;
    $totalVehicles = isset($row2['totalVehicles']) ? (int)$row2['totalVehicles'] : 0;
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Query failed: ' . mysqli_error($link)
    ]);
    mysqli_close($link);
    exit();
}

// Return the results as a JSON object
$response = array(
    'success' => true,
    'activeVehicles' => $activeVehicles,
    'totalVehicles' => $totalVehicles
);

header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($link);
?>
