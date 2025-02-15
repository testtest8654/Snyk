<!DOCTYPE html>
<html>
<head>
  <?php require_once('tmpl-head.php') ?>
  <style>
    .img-wrapper {
      text-align: center;
    }
    img {
      width: 300px;
      height: 300px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Business Card Generator</h1>
    <form action="login.php">
      <fieldset>
        <label for="nameField">Input your nick name</label>
        <input id="nameField" type="text" name="name" value="" maxlength="19">
        <input class="button-primary" type="submit" value="Start">
      </fieldset>
    </form>
    <div class="img-wrapper">
      <img src="./resources/name.gif">
    </div>
  </div>
  <?php require_once('tmpl-footer.php') ?>
</body>

</html>


