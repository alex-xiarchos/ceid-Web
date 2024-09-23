<?php
    include 'connection.php';
    if (isset($_GET["id"])) {
        $productId = intval($_GET["id"]);
        $query = "SELECT items.id, items.name, items.category_id, items.quantity, category.name AS category
                FROM items 
                JOIN category ON items.category_id = category.id
                WHERE items.id = $productId";

        if ($result = $link->query($query)) {
            if ($row = $result->fetch_assoc()) {
                echo json_encode($row);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Product not found"]);
            }
            $result->free();
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to fetch product"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Product ID is required"]);
    }

?>