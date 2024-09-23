<?php
session_start();

// Clear the session data from memory
session_unset();

// Destroy the session on the server
session_destroy();

// Ensure the client-side cache is invalidated
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Redirect to the login or home page
header("Location: ../index.html");

exit; // Make sure no further code is executed
