<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="">
  <title>Static Template</title>

  <!-- CSS styles -->
  <link href="./css/style.min.css" rel="stylesheet">
</head>

<body class="bg-dark text-white d-flex flex-column vh-100">
  <nav class="navbar navbar-expand-lg navbar-dark border-bottom">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">Download Station</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="/">Home</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Sites
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="/animeflv.php">AnimeFlV</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <div class="section-row" id="two-columns">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-md-6">
          Desktop
        </div>

        <div class="col-12 col-md-6">
          Synology
        </div>
      </div>
    </div>
  </div>
  <footer class="footer mt-auto py-3 text-center border-top">
    <div class="container">
      <span>© Copyright 2025 — Download Station. All rights reserved. Created by <a href="https://cv.miniricky.dev" target="_blank" rel="noopener noreferrer">Miniricky</a></span>
    </div>
  </footer>
  <script src="./js/scripts-all.min.js"></script>
</body>

</html>
