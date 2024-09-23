<?php
include 'connection.php';

// Get POST data
$offer_id = $_POST['task_id'];

// Fetch the request's quantity, item_id, and rescuer_assigned (user_id) from the requests table
$query = "SELECT item_id, quantity, rescuer_assigned FROM requests WHERE id='$offer_id'";
$result = mysqli_query($link, $query);
$request = mysqli_fetch_assoc($result);

if ($request) {
    $item_id = $request['item_id'];
    $request_quantity = $request['quantity'];
    $user_id = $request['rescuer_assigned'];

    // Fetch the current quantity of the item in the vehicle_cargo
    $query = "SELECT quantity FROM vehicle_cargo WHERE user_id='$user_id' AND item_id='$item_id'";
    $result = mysqli_query($link, $query);
    $cargo = mysqli_fetch_assoc($result);

    if ($cargo) {
        $new_quantity = $cargo['quantity'] - $request_quantity;

        if ($new_quantity >= 0) {
            // Update the quantity in the vehicle_cargo
            $query = "UPDATE vehicle_cargo SET quantity='$new_quantity' WHERE user_id='$user_id' AND item_id='$item_id'";
            mysqli_query($link, $query);

            // Update the request status to completed
            $query = "UPDATE requests SET status='completed' WHERE id='$offer_id'";
            if (mysqli_query($link, $query)) {
                echo 1;
            } else {
                echo 0;
            }
        } else {
            echo 2;
        }
    } else {
        echo 3;
    }
} else {
    echo "Request not found.";
}

mysqli_close($link);
?>
