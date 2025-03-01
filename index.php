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
  <div class="section-row bg-purple-dark" id="hero">
    <div class="container-fluid">
      <h1>Download Station</h1>
      <p>Welcome to your centralized anime download hub, where you can explore our extensive collection from AnimeFLV and other popular sources. Access and manage your favorite anime series download episodes directly to your desktop or Synology NAS. Whether you're building a personal library or setting up your media server, we provide a seamless downloading experience with direct downloads and Synology Download Station integration. Simple, efficient, and organized: everything you need in one place.</p>
    </div>

    <svg viewBox="0 0 1920 60" aria-hidden="true">
      <path fill="#0b0c2a" d="M-153.5,85.5a4002.033,4002.033,0,0,1,658-71c262.854-6.5,431.675,15.372,600,27,257.356,17.779,624.828,19.31,1089-58v102Z"></path>
    </svg>
  </div>
  <div class="section-row" id="three-cards">
    <div class="container-fluid">
      <div class="animeflv">
        <div class="image">
          <a href="./animeflv.php">
            <img src="./images/sites/animeflv.png" alt="AnimeFLV logo">
          </a>
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
