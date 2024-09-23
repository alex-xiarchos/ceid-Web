<?php
include 'connection.php';

$name = $_POST['name'];
$category = $_POST['category'];
$quantity = $_POST['baseQuantity'];

// Get the category ID
$category_query = "SELECT id FROM category WHERE name = '$category' LIMIT 1";
$category_result = mysqli_query($link, $category_query);

if ($category_result && mysqli_num_rows($category_result) > 0) {
    $category_row = mysqli_fetch_assoc($category_result);
    $category_id = $category_row['id'];

    // Insert the new item
    $sql = "INSERT INTO items (name, category_id, quantity) VALUES ('$name', $category_id, $quantity)";
    if (mysqli_query($link, $sql)) {
        echo 1;
    } else {
        echo 0;
    }
} else {
    echo 0; // Category not found
}

mysqli_close($link);
?>
