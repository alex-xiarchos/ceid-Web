<?php
include 'connection.php';
$rescuerId = $_POST['rescuerId'];

// Check if the rescuer ID is in the requests or offers tables
$query = "SELECT COUNT(*) as count FROM requests WHERE rescuer_assigned = ? UNION ALL SELECT COUNT(*) as count FROM offers WHERE rescuer_assigned = ?";
$stmt = $link->prepare($query);
$stmt->bind_param('ii', $rescuerId, $rescuerId);
$stmt->execute();
$result = $stmt->get_result();

$totalCount = 0;
while ($row = $result->fetch_assoc()) {
    $totalCount += $row['count'];
}

$response = ['hasTasks' => $totalCount > 0];

echo json_encode($response);
?>