<?php
  session_start();
  $username = $_SESSION['username'];
  if (empty($username)) {
    header("Location: index.php");
    exit();
  }

  $csrf_token = bin2hex(random_bytes(16));
  $_SESSION['csrf-token'] = $csrf_token;

  require_once('csp.php');

  if (strlen($_SESSION['name']) >= 20) {
    die('name too long');
  }

?>
<!DOCTYPE html>
<html>
<head>
  <?php require_once('tmpl-head.php') ?>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.3.6/purify.min.js" integrity="sha512-DJjvM/U3zCRpzrYboJgg23iLHapWcS2rlo7Ni18Cdv+FMs6b3gUF7hQihztj4uVkHHfUwk7dha97jVzRqUJ7hg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <meta name="csrf-token" content="<?= $csrf_token ?>">  
</head>
<body>
  <div class="container">
    <h1>Business Card Generator</h1>
    <h3>Your random Card ID: <? echo $username ?> <br></h3>
    <form action="preview.php" method="POST">
      <fieldset>
        <div>
          <input type="hidden" name="csrf-token" value="<?= $csrf_token ?>" />
        </div>
        <div>
          <label for="nameField">Name</label>
          <input id="nameField" type="text" name="name" value="<?= $_SESSION['name']; ?>" maxlength="19">
        </div>
        <div>
          <label for="descField">Description</label>
          <textarea id="descField" name="desc">Hi, nice to meet you! It's my favorite video: https://www.youtube.com/embed/dQw4w9WgXcQ</textarea>
        </div>
        <div>
          <label>Current Theme</label>
          <p class="theme-text"></p>
        </div>

        <input class="button-primary" type="submit" value="Preview">
        <a class="button button-outline" href="update-theme.php">update theme</a>
        <a class="button button-outline btn-update-name" href="#">update name</a>
        <a class="button button-clear" href="index.php">restart</a>
      </fieldset>
    </form>
    <script src="resources/app.js"></script>
  </div>
  <?php require_once('tmpl-footer.php') ?>
</body>

</html>


