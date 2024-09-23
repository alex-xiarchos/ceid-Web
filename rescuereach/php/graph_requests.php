<?php
include "connection.php"; // Include your database connection

$startDate = $_GET['startDate'] ?? '';
$endDate = $_GET['endDate'] ?? '';

// Query for counting responses in each status
$query = "SELECT status, COUNT(*) as count FROM requests WHERE created_at >= '$startDate' AND created_at < DATE_ADD('$endDate', INTERVAL 1 DAY) GROUP BY status;";

$result = mysqli_query($link, $query);
$data = ['pending' => 0, 'accepted' => 0, 'cancelled' => 0, 'completed' =>0];

while ($row = mysqli_fetch_assoc($result)) {
    $data[$row['status']] = (int)$row['count'];
}

echo json_encode($data);

mysqli_close($link);
?>

