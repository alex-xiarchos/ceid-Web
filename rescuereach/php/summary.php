<?php
include "connection.php"; 

// Query to get the total number of items
$totalItemsQuery = "SELECT COUNT(*) as totalItems FROM items";
$totalItemsResult = mysqli_query($link, $totalItemsQuery);

$totalItems = 0;
if ($totalItemsResult) {
    $totalItemsRow = mysqli_fetch_assoc($totalItemsResult);
    $totalItems = $totalItemsRow['totalItems'];
}

// Query to get the number of low stock items (items with quantity less than 20)
$lowStockItemsQuery = "SELECT COUNT(*) as lowStockItems FROM items WHERE quantity < 20";
$lowStockItemsResult = mysqli_query($link, $lowStockItemsQuery);

$lowStockItems = 0;
if ($lowStockItemsResult) {
    $lowStockItemsRow = mysqli_fetch_assoc($lowStockItemsResult);
    $lowStockItems = $lowStockItemsRow['lowStockItems'];
}

//JSON object
$response = array(
    'success' => true,
    'totalItems' => $totalItems,
    'lowStockItems' => $lowStockItems
);

header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($link);
?>
