<?php
	session_start();
	include "connection.php"; // Database connection

	// Fetching the base location
	$query = "SELECT * FROM base";
	$result = mysqli_query($link, $query);

	if ($row = mysqli_fetch_assoc($result)) {
		echo json_encode($row);
	} else {
		echo "Error fetching base location";
	}

	mysqli_close($link);
?>
