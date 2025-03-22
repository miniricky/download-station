<!DOCTYPE html>
<html lang="">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="">
  <meta name="keywords" content="">
  <meta name="author" content="">
  <meta name="robots" content="">

  <!-- Open Graph / Social Media -->
  <meta property="og:title" content="">
  <meta property="og:description" content="">
  <meta property="og:image" content="">
  <meta property="og:url" content="">

  <link rel="canonical" href="">
  <title></title>

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
            <a class="nav-link active" aria-current="page" href="/">Inicio</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Animes
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="/animeflv.php">AnimeFlV</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <div class="section-row" id="sites">
    <div class="container-fluid">
      <h1>Sitios</h1>

      <form id="addSiteForm" class="row row-30" enctype="multipart/form-data">
        <h2 class="h5">Agregar nuevo sitio</h2>

        <div class="d-flex gap-2 col-12 col-md-6 mb-3">
          <label for="site" class="form-label">Sitio</label>
          <input type="text" class="form-control" id="site" placeholder="Agregar Sitio">
        </div>

        <div class="d-flex gap-2 col-12 col-md-6 mb-3">
          <label for="url" class="form-label">URl</label>
          <input type="text" class="form-control" id="url" placeholder="Agregar URL">
        </div>

        <div class="d-flex gap-2 col-12 col-md-6 mb-3">
          <label for="image" class="form-label">Imagen</label>
          <input class="form-control" type="file" id="image">
        </div>

        <div class="col-12 col-md-6 mb-3">
          <button type="submit" class="btn btn-secondary w-100">Agregar nuevo sitio</button>
        </div>
      </form>
    </div>
  </div>
  <footer class="footer mt-auto py-3 text-center bg-purple-dark">
    <div class="container">
      <span>© Copyright 2025 — Download Station. Todos los derechos reservados. Creado por <a class="underline-link" href="https://cv.miniricky.dev" target="_blank" rel="noopener noreferrer">Miniricky</a></span>
    </div>
  </footer>
  <script src="./js/scripts-all.min.js"></script>
</body>

</html>
