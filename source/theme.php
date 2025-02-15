<?php
  session_start();
  $username = $_SESSION['username'];
  if (empty($username)) {
    header("Location: index.php");
    exit();
  }
  
  $json = file_get_contents('php://input');
  $decoded_json = "{}";
  if (!empty($json)) {
    $_SESSION['theme'] = $json;
  }

  if (isset($_SESSION['theme']) && !empty($_SESSION['theme'])) {
    $decoded_json = json_decode($_SESSION['theme']);
  } else {
    $decoded_json = json_decode("{}");
  }
  

  header('Content-Type: application/json');
  echo json_encode($decoded_json, JSON_PRETTY_PRINT);
?>
