<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="">
  <title>Download Station</title>

  <!-- CSS styles -->
  <link href="./css/style.min.css" rel="stylesheet">
</head>

<body class="bg-purple text-white d-flex flex-column vh-100">
  <nav class="navbar navbar-expand-lg navbar-dark bg-purple-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">Download <span class="text-danger">Station</span></a>
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
  <div class="section-row" id="scraping">
    <div class="container-fluid">
      <div class="row row-30">
        <div class="col-12 col-md-6 col-lg-4">
          <div class="animeflv-wrapper d-flex flex-column align-items-center">
            <div class="image">
              <img src="./images/sites/animeflv.png" alt="AnimeFLV logo">
            </div>

            <div class="body d-flex flex-column">
              <button type="button" id="onAir" class="btn btn-link status">On Air</button>
              <button type="button" id="finished" class="btn btn-link status">Finished</button>
            </div>

            <div class="progress-wrapper w-100 text-center"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <footer class="footer mt-auto py-3 text-center bg-purple-dark">
    <div class="container">
      <span>© Copyright 2025 — Download Station. All rights reserved. Created by <a class="underline-link" href="https://cv.miniricky.dev" target="_blank" rel="noopener noreferrer">Miniricky</a></span>
    </div>
  </footer>
  <script src="./js/scripts-all.min.js"></script>
</body>

</html>
