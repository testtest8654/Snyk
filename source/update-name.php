<?php
  session_start();
  $username = $_SESSION['username'];
  header('X-Content-Type-Options: nosniff');
  header('Content-Type: text/plain');
  if (empty($username)) {
    header("Location: index.php");
    exit();
  }

  $csrf_token = $_SESSION['csrf-token'];
  if (empty($csrf_token) || $_POST['csrf-token'] !== $csrf_token) {
    die('csrf token invalid');
  }

  $name = strval($_POST['name']);

  if (strlen($name) >= 20) {
    die("name too long");
  }

  $_SESSION['name'] = $name;

  die('success');
?>

