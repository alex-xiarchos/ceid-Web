<?php
include 'connection.php';

$data = array();
$data["categories"] = array();
$data["products"] = array();

// Fetch distinct category names
$query = "SELECT DISTINCT name FROM category";
if ($result = $link->query($query)) {
    while ($row = $result->fetch_assoc()) {
        $data["categories"][] = $row["name"];
    }
    $result->free();
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch categories"]);
    exit();
}

// Fetch products
if (isset($_GET["category"])) {
    $category = strtolower($link->real_escape_string($_GET["category"]));
    $query = "SELECT id, name, category_id FROM items WHERE category_id = (SELECT id FROM category WHERE LOWER(name) = '$category')";
} else if (isset($_GET["productName"])) {
    $productName = strtolower($link->real_escape_string($_GET["productName"]));
    $query = "SELECT id, name, category_id FROM items WHERE LOWER(name) LIKE '%$productName%'";
} else {
    $query = "SELECT id, name, category_id FROM items";
}

if ($result = $link->query($query)) {
    while ($row = $result->fetch_assoc()) {
        $productId = $row["id"];
        $data["products"][$productId] = array(
            "id" => $productId,
            "name" => $row["name"],
            "category_id" => $row["category_id"]
        );
    }
    $result->free();
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch products"]);
    exit();
}

// Fetch category names for each product's category_id
foreach ($data["products"] as &$product) {
    $categoryId = $product["category_id"];
    $categoryQuery = "SELECT name FROM category WHERE id = $categoryId";
    if ($categoryResult = $link->query($categoryQuery)) {
        if ($categoryRow = $categoryResult->fetch_assoc()) {
            $product["category"] = $categoryRow["name"];
        }
        $categoryResult->free();
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch category names"]);
        exit();
    }
}

// Close connection
$link->close();

// Output the JSON encoded data
echo json_encode($data);
?>