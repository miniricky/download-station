<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Descarga tus animes y películas favoritas de diferentes fuentes en un solo lugar.">
  <meta name="keywords" content="descargar anime, descargar películas, anime online, streaming anime, animeflv, películas online">
  <meta name="author" content="Download Station">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Social Media -->
  <meta property="og:title" content="Download Station - Tu Centro de Descargas de Anime">
  <meta property="og:description" content="Descarga tus animes y películas favoritas de diferentes fuentes en un solo lugar.">
  <meta property="og:image" content="">
  <meta property="og:url" content="https://download-station.com">

  <link rel="canonical" href="https://download-station.com">
  <title>Download Station</title>

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
  <div class="section-row bg-purple-dark" id="hero">
    <div class="container-fluid">
      <h1 class="title">Download Station</h1>

      <p>Bienvenido a tu plataforma centralizada de descargas de anime, donde podrás explorar nuestra extensa colección de AnimeFLV y otras fuentes populares. Accede y gestiona los episodios de descarga de tus series de anime favoritas directamente en tu ordenador o Synology NAS. Tanto si creas una biblioteca personal como si configuras tu servidor multimedia, te ofrecemos una experiencia de descarga fluida con descargas directas e integración con Synology Download Station. Sencillo, eficiente y organizado: todo lo que necesitas en un solo lugar.</p>
    </div>

    <svg viewBox="0 0 1920 60" aria-hidden="true">
      <path fill="#0b0c2a" d="M-153.5,85.5a4002.033,4002.033,0,0,1,658-71c262.854-6.5,431.675,15.372,600,27,257.356,17.779,624.828,19.31,1089-58v102Z"></path>
    </svg>
  </div>
  <div class="section-row" id="site-cards">
    <div class="container-fluid">
      <?php
    require_once './includes/db.php';
    
    $sql = "SELECT * FROM sites ORDER BY created_at ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $sites = $stmt->fetchAll(PDO::FETCH_ASSOC);
    ?>
      <div class="row">
        <?php
      foreach ($sites as $site) {
        $siteName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $site['name']));
        ?>
        <div class="col-12 col-md-6 col-lg-4">
          <div class="<?php echo $siteName; ?> site-card d-flex flex-column align-items-center">
            <div class="image">
              <a href="./<?php echo $siteName; ?>.php">
                <img src="<?php echo $site['image_url']; ?>" alt="<?php echo $site['name']; ?> logo">
              </a>
            </div>
          </div>
        </div>
        <?php
      }
      ?>
      </div>
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
