<?php


$servername = "127.0.0.1";
$username = "root";
$password = "";
$database = "interstellar";

// Create the connection
$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


?>
