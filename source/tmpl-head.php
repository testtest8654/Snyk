<meta charset="UTF-8" />
<meta name="viewport" content="width=devide-width, initial-scale=1.0" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.css">

<style>
  html,body {
    padding: 0;
    margin: 0;
  }

  body {
    background-image: url(resources/bg.jpg);
    background-position: center center;
    background-size: cover;
    color: #333;
  }

  h1 {
    font-size: 60px;
  }

  footer {
    width: 100%;
    background: rgba(255, 255, 255, 0.5);
    height: 50px;
    display: flex;
    padding: 0px 24px;
    align-items: center;
    justify-content: center;
  }

  .container {
    margin: 36px auto;
    width: 750px;
    background: white;
    border-radius: 24px;
    padding: 36px;
    height: calc(100vh - 72px - 50px);
    overflow: auto;
  }

  #messageModal:before {
    content: "";
    position: absolute;
    background: rgb(106 187 227 / 83%);
    width: 400px;
    height: 100px;
    border-radius: 8px;
    z-index: -1;
  }

  #messageModal {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 18px;
  }

  .buiness-card {
    width: 450px;
    min-height: 250px;
    background-color: #fcfcfc;
    margin-bottom: 32px;
    padding: 20px;
    overflow: hidden;
    font-weight: normal;
    letter-spacing: 1px;
    color: #666;
    border: solid 1px rgba(0,0,0,0.15);
    border-radius: 6px;
    box-shadow: 0px 0px 15px rgba(0,0,0,0.2);
    transition: all 0.2s ease-in;
  }

  .buiness-card hr {
    border-color: #333;
  }

</style>
