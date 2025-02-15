<?php
  session_start();
  
  if (!isset($_GET['name'])) {
    die('you need to choose a name');
  }

  $name = strval(empty($_GET['name']) ? 'guest' : $_GET['name']);

  if (strlen($name) >= 20) {
    die('name too long');
  }

  session_regenerate_id();
  $keys = array_keys($_SESSION);
  foreach ($keys as $key){
    unset($_SESSION[$key]);
  }

  $_SESSION['name'] = $name;
  $_SESSION['username'] = bin2hex(random_bytes(12));
  $_SESSION['theme'] = '{"primary": {"text": {"dark": "#47fb4e","light": "#666"},"bg": {"dark": "#2a2944","light": "#fcfcfc"}},"secondary": {"text": {"dark": "#ffffff","light": "#404594"},"bg": {"dark": "#ffaf00","light": "#ffe1a0"}}}';
  $csrf_token = bin2hex(random_bytes(16));
  $_SESSION['csrf-token'] = $csrf_token;

  header("Location: app.php");
?>