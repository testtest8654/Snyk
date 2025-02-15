<?php
  session_start();
  $username = $_SESSION['username'];
  if (empty($username)) {
    header("Location: index.php");
    exit();
  }
?>

<!DOCTYPE html>
<html>
<head>
  <?php require_once('tmpl-head.php') ?>
</head>
<body>
  <div class="container">
    <h1>Business Card Generator</h1>
    
    <form>
      <fieldset>
        <h3><b>Primary Theme</b></h3>
        <h4>Text Color</h4>
        <div id="primary-theme">
          <label>Light</label>
          <input name="text-light" value="#666">

          <label>Dark</label>
          <input name="text-dark" value="#47fb4e">

          <h4>Background Color</h4>
          <label>Light</label>
          <input name="bg-light" value="#fcfcfc">
          <label>Dark</label>
          <input name="bg-dark" value="#2a2944">
        </div>
      </fieldset>
    </form>
    <form>
      <fieldset>
        <h3><b>Secondary Theme</b></h3>
        <h4>Text Color</h4>
        <div id="secondary-theme">
          <label>Light</label>
          <input name="text-light" value="#404594">
          <label>Dark</label>
          <input name="text-dark" value="#ffffff">

          <h4>Background Color</h4>
          <label>Light</label>
          <input name="bg-light" value="#ffe1a0">
          <label>Dark</label>
          <input name="bg-dark" value="#ffaf00">
        </div>
      </fieldset>
    </form>
    <button id="btn-update">Update</button>
    <a class="button button-clear" href="app.php">Back</a>
  </div>
  <?php require_once('tmpl-footer.php') ?>
  <script>
    fetch("theme.php")
      .then((res) => res.json())
      .then((theme) => {
        if (theme.primary) {
          setThemeValues('#primary-theme', theme.primary)
        }
        if (theme.secondary) {
          setThemeValues('#secondary-theme', theme.secondary)
        }
    })

    function setThemeValues(name, theme) {
      const parent = document.querySelector(name)
      parent.querySelector('input[name=text-dark]').value = theme.text.dark
      parent.querySelector('input[name=text-light]').value = theme.text.light
      parent.querySelector('input[name=bg-dark]').value = theme.bg.dark
      parent.querySelector('input[name=bg-light]').value =  theme.bg.light
    }

    function getThemeValues(name) {
      const parent = document.querySelector(name)
      return {
        text: {
          dark: parent.querySelector('input[name=text-dark]').value,
          light: parent.querySelector('input[name=text-light]').value
        },
        bg: {
          dark: parent.querySelector('input[name=bg-dark]').value,
          light: parent.querySelector('input[name=bg-light]').value
        }
      }
    }

    document.querySelector('#btn-update').addEventListener('click', () => {
      fetch('theme.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          primary: getThemeValues('#primary-theme'),
          secondary: getThemeValues('#secondary-theme')
        })
      }).then(() => {
        location = 'app.php#msg=updated success'
      }).catch(err => {
        console.log(err)
        alert('update failed')
      })
    })
  </script>
</body>

</html>


