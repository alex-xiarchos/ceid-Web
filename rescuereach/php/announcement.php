<?php
include "connection.php"; // Include your database connection

// Fetch categories
$categorySql = "SELECT id, name FROM category";
$categoryResult = mysqli_query($link, $categorySql);

if (!$categoryResult) {
    echo json_encode(['error' => mysqli_error($link)]);
    exit;
}

$categories = mysqli_fetch_all($categoryResult, MYSQLI_ASSOC);

// Fetch items
$itemSql = "SELECT id, name, category_id FROM items ORDER BY name ASC";
$itemResult = mysqli_query($link, $itemSql);

if (!$itemResult) {
    echo json_encode(['error' => mysqli_error($link)]);
    exit;
}

$items = mysqli_fetch_all($itemResult, MYSQLI_ASSOC);

// Return categories and items as a JSON object
$response = array(
    'categories' => $categories,
    'items' => $items
);

header('Content-Type: application/json');
echo json_encode($response);

mysqli_close($link);
?>
