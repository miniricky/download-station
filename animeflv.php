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
  <div class="section-row" id="animeflv">
    <?php
    require_once 'includes/db.php';
    $site_name = "animeflv";
    $items_per_page = 24;
  ?>
    <div class="container-fluid">
      <div class="search-container">
        <label for="animeSearch" class="form-label">Search</label>
        <input class="form-control" type="search" id="animeSearch" placeholder="Type to search..." autocomplete="off">
      </div>

      <div class="filters-container">
        <?php
        // Get unique genres
        $genres_sql = "SELECT DISTINCT ag.genre 
        FROM anime_genres ag
        JOIN animes a ON ag.anime_id = a.id
        JOIN sites s ON a.site_id = s.id
        WHERE s.name = :site_name
        ORDER BY ag.genre";
        
        $genres_stmt = $pdo->prepare($genres_sql);
        $genres_stmt->bindParam(':site_name', $site_name, PDO::PARAM_STR);
        $genres_stmt->execute();
        $genres = $genres_stmt->fetchAll(PDO::FETCH_COLUMN);
      ?>
        <label class="form-label">Genres</label>
        <div class="btn-group flex-wrap" role="group">
          <?php foreach ($genres as $genre): ?>
          <input type="checkbox" class="btn-check genre-filter" name="genre[]" id="genre_<?php echo htmlspecialchars($genre); ?>" value="<?php echo htmlspecialchars($genre); ?>" <?php echo (isset($_GET['genre']) && in_array($genre, $_GET['genre'])) ? 'checked' : ''; ?>>
          <label class="btn btn-sm" for="genre_<?php echo htmlspecialchars($genre); ?>">
            <?php echo htmlspecialchars($genre); ?>
          </label>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="anime-container row row-30">
        <?php
        require_once 'includes/db.php';
        $site_name = "animeflv";
        $items_per_page = 24;
        
        $current_page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $offset = ($current_page - 1) * $items_per_page;

        try {
            $where_conditions = ["sites.name = :site_name"];
            $params = [':site_name' => $site_name];
    
            // Add genre filters if selected
            if (isset($_GET['genre']) && !empty($_GET['genre'])) {
                $genre_placeholders = [];
                foreach ($_GET['genre'] as $key => $genre) {
                    $placeholder = ":genre$key";
                    $genre_placeholders[] = $placeholder;
                    $params[$placeholder] = $genre;
                }
                $where_conditions[] = "EXISTS (
                    SELECT 1 FROM anime_genres ag 
                    WHERE ag.anime_id = animes.id 
                    AND ag.genre IN (" . implode(',', $genre_placeholders) . ")
                )";
            }
    
            $where_clause = implode(' AND ', $where_conditions);
    
            // Modify count query
            $count_sql = "SELECT COUNT(DISTINCT animes.id) as total 
                          FROM animes 
                          JOIN sites ON animes.site_id = sites.id 
                          WHERE $where_clause";
            
            $count_stmt = $pdo->prepare($count_sql);
            foreach ($params as $key => $value) {
                $count_stmt->bindValue($key, $value);
            }
            $count_stmt->execute();
            $total_rows = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
            $total_pages = ceil($total_rows / $items_per_page);
    
            // Modify main query
            $sql = "SELECT DISTINCT animes.*, sites.name AS site_name, sites.url AS site_url
                    FROM animes
                    JOIN sites ON animes.site_id = sites.id
                    WHERE $where_clause
                    LIMIT :limit OFFSET :offset";
            
            $stmt = $pdo->prepare($sql);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $items_per_page, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $animes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if ($animes) {
              foreach ($animes as $anime) {
                echo '<div class="anime-wrapper col-6 col-md-3 col-xl-2">';
                echo '<div class="anime" id="' . $anime['id']  . '">';  
                echo '<div class="image"><img src="' . $anime['image_url'] . '" width="100"></div>';
                echo '<div class="status"><span class="type">' . $anime['type'] . '</span>';
                echo '<span class="type">' . $anime['status'] . '</span></div>';
                echo '<div class="text">';
                echo '<h2 class="h6">' . $anime['title'] . '</h2></div>';
                echo '<button type="button" class="btn btn-link viewChapters">Charapters</button>';
                echo "</div></div>";
              }
            } else {
              echo "No animes found for the site '$site_name'.";
            }
        } catch (PDOException $e) {
          echo "Error in query: " . $e->getMessage();
        }
      ?>
      </div>

      <?php
      // In the pagination section, modify the links to include genre parameters
      $query_params = $_GET;
      unset($query_params['page']); // Remove current page from base params
      $base_url = '?' . http_build_query($query_params);
      if (!empty($query_params)) {
        $base_url .= '&';
      }
    ?>

      <div class="pagination-row">
        <nav arial-label="Page navigation">
          <ul class="pagination">
            <li class="page-item <?php echo ($current_page == 1) ? 'deactivate' : ''; ?>">
              <a class="page-link" href="<?php echo ($current_page > 1) ? $base_url . 'page=' . ($current_page - 1) : '#'; ?>">
                Prev
              </a>
            </li>

            <?php for ($i = 1; $i <= $total_pages; $i++): ?>
            <li class="page-item <?php echo ($i == $current_page) ? 'active' : ''; ?>">
              <a class="page-link" href="<?php echo $base_url . 'page=' . $i; ?>">
                <?php echo $i; ?>
              </a>
            </li>
            <?php endfor; ?>

            <li class="page-item <?php echo ($current_page == $total_pages) ? 'deactivate' : ''; ?>">
              <a class="page-link" href="<?php echo ($current_page < $total_pages) ? $base_url . 'page=' . ($current_page + 1) : '#'; ?>">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="modal fade" id="sidModal" tabindex="-1" aria-labelledby="sidModallLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content bg-dark text-white">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Synology Credentials</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="section-row h-100" id="sid">
            <div class="container h-100 align-content-center">
              <form id="sid-form">
                <h1 class="h3 fw-normal">Add your credentials</h1>

                <label for="username">Username</label>
                <input type="text" class="form-control" id="username" aria-describedby="username" placeholder="Username">

                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" aria-describedby="password" placeholder="Password" autocomplete="current-password">

                <label for="domain">Domain</label>
                <input type="text" class="form-control" id="domain" aria-describedby="domain" placeholder="Domain">

                <span id="session" class="form-text d-block text-white">
                  Your credentials are only saved in cookies, not in the database.
                </span>

                <button class="btn btn-primary w-100 py-2" id="" type="submit">Add credentials</button>
              </form>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
