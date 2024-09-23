<?php
include "connection.php"; // Include your database connection

$user_id = $_POST['user_id'];

// Query to get the requests and offers for the user
$userRequestsQuery = "SELECT r.id, r.status, r.created_at, r.quantity as rquantity, i.name FROM requests r INNER JOIN items i ON i.id=r.item_id WHERE citizen_id = '$user_id'";
$userOffersQuery = "SELECT o.id, o.status, o.created_at, o.quantity as oquantity, i.name FROM offers o INNER JOIN items i ON i.id=o.item_id WHERE citizen_id = '$user_id'";

$result1 = mysqli_query($link, $userRequestsQuery);
$result2 = mysqli_query($link, $userOffersQuery);

$userRequests = array();
$userOffers = array();

if ($result1) {
    while ($row1 = mysqli_fetch_assoc($result1)) {
        $userRequests[] = $row1;
    }
} else {
    error_log("Query failed: " . mysqli_error($link));
}

if ($result2) {
    while ($row2 = mysqli_fetch_assoc($result2)) {
        $userOffers[] = $row2;
    }
} else {
    error_log("Query failed: " . mysqli_error($link));
}

if ($result1 && $result2) {
    // Return the results as a JSON object
    $response = array(
        'success' => true,
        'userRequests' => $userRequests,
        'userOffers' => $userOffers
    );
} else {
    // Return an error response
    $response = array(
        'success' => false,
        'message' => 'Query failed: ' . mysqli_error($link)
    );
}

header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($link);
?>
