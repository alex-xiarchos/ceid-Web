<?php
include 'connection.php';

$productId = $_POST['productId'];

$sql = "DELETE FROM items WHERE id=$productId";
if (mysqli_query($link, $sql)) {
    echo 1;
} else {
    echo 0;
}

mysqli_close($link);
?>
