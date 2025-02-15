<?php
  header("Content-Security-Policy: ".
      "default-src 'self'; " .
      "img-src http: https:; " .
      "style-src 'unsafe-inline' http: https:; " .
      "object-src 'none';" .
      "base-uri 'none';" .
      "font-src http: https:;".
      "frame-src https://www.youtube.com/;".
      "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/;");
?>