<?php
  session_start();
  $username = $_SESSION['username'];
  if (empty($username)) {
    header("Location: index.php");
    exit();
  }

  if (isset($_GET['save'])) {
    if ($_SESSION['temp-name'] && $_SESSION['temp-desc']) {
      $_SESSION['name'] = $_SESSION['temp-name'];
      $_SESSION['desc'] = $_SESSION['temp-desc'];
      header("Location: app.php");
      exit();
    }
  }

  $csrf_token = $_SESSION['csrf-token'];
  if (empty($csrf_token) || $_POST['csrf-token'] !== $csrf_token) {
    header("Location: app.php#msg=csrf token check failed");
    die();
  }

  $name = strval($_POST['name']);
  $desc = strval($_POST['desc']);

  if (strlen($name) >= 20) {
    header("Location: app.php#msg=name too long");
    die();
  }

  $_SESSION['temp-name'] = $name;
  $_SESSION['temp-desc'] = $desc;

  require_once('csp.php');

  $dangerous_words = ['eval', 'setTimeout', 'setInterval', 'Function', 'constructor', 'proto', 'on', '%', '&', '#', '?', '\\'];

  foreach ($dangerous_words as $word) {
    if (stripos($desc, $word) !== false){
      header("Location: app.php#msg=dangerous word detected!");
      die();
    }
  }

  $name = htmlspecialchars($name);
  $desc = htmlspecialchars($desc);

  $desc = preg_replace('/(https?:\/\/www\.youtube\.com\/embed\/[^\s]*)/', '<iframe src="$1"></iframe>', $desc);

  $desc = preg_replace('/(https?:\/\/[^\s]*\.(png|jpg|gif))/', '<img src="$1">', $desc);
  
?>
<!DOCTYPE html>
<html>
<head>
  <?php require_once('tmpl-head.php') ?>
  <style>
    #main {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Business Card Generator</h1>
    <div id="main" class="hide">
      <div class="buiness-card">
        <h2><?= $name ?></h2>
        <hr />
        <p>
          <?= $desc ?>
        </p>
      </div>
      <form>
        <label>Mode</label>
        <div>
          <span>
            <input type="radio" id="mode2" name="mode" value="light" checked="">
            <label class="label-inline" for="mode2">Light</label>
          </span>
          <span>
            <input type="radio" id="mode1" name="mode" value="dark">
            <label class="label-inline" for="mode1">Dark</label>
          </span>
        </div>

        <label>Theme</label>
        <div>
          <span>
            <input type="radio" id="theme1" name="theme" value="primary" checked>
            <label class="label-inline" for="theme1">Primary</label>
          </span>
          <span>
            <input type="radio" id="theme2" name="theme" value="secondary">
            <label class="label-inline" for="theme2">Secondary</label>
          </span>
        </div>

        <input type="hidden" name="save" value="1">
        <input type="submit" value="save">
        <a class="button button-clear" href="app.php">back</a>
      </form>
    </div>
    <div id="notice">
      <p><b>Please noted that this website is still in beta, use at your own risk.</b></p>
      <button id=showBtn>I got it</button>
    </div>
    
  </div>
  <?php require_once('tmpl-footer.php') ?>
  <script src="resources/preview.js"></script>
</body>
</html>

