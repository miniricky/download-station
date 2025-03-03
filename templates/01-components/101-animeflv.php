<div class="section-row" id="animeflv">
  <?php
    require_once 'includes/db.php';
    $site_name = "animeflv";
    $items_per_page = 24;
  ?>
  <div class="container-fluid">
    <h1 class="title">AnimeFLV</h1>

    <div class="row row-30 flex-lg-row-reverse">
      <div class="sidebar col-12 col-lg-4 col-xl-3">
        <div class="sticky-lg-top">
          <div class="search-container">
            <label for="animeSearch" class="form-label h4">Search</label>
            <input class="form-control" type="search" id="animeSearch" placeholder="Type to search..." autocomplete="off">
            <div id="animeSearchHelpBlock" class="form-text text-white">
              The search and filters are independently.
            </div>
          </div>

          <div class="filters-container">
            <h2 class="h4">Filters</h2>

            <div class="genres-wrapper">
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
              <div class="dropdown w-100">
                <button class="btn btn-secondary dropdown-toggle w-100 d-flex align-items-center justify-content-between" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Select Genres
                </button>
                <ul class="dropdown-menu w-100">
                  <?php foreach ($genres as $genre): ?>
                    <li class="dropdown-item">
                      <div class="form-check">
                        <input class="form-check-input genre-filter" type="checkbox" name="genre[]" 
                          id="genre_<?php echo htmlspecialchars($genre); ?>" 
                          value="<?php echo htmlspecialchars($genre); ?>"
                          <?php echo (isset($_GET['genre']) && in_array($genre, $_GET['genre'])) ? 'checked' : ''; ?>>
                        <label class="form-check-label w-100" for="genre_<?php echo htmlspecialchars($genre); ?>">
                          <?php echo htmlspecialchars($genre); ?>
                        </label>
                      </div>
                    </li>
                  <?php endforeach; ?>
                </ul>
              </div>
            </div>

            <!-- Add type filter -->
            <div class="type-wrapper">
              <?php
                // Get unique type values
                $type_sql = "SELECT DISTINCT type 
                           FROM animes a
                           JOIN sites s ON a.site_id = s.id
                           WHERE s.name = :site_name 
                           AND type IS NOT NULL
                           ORDER BY type";
                
                $type_stmt = $pdo->prepare($type_sql);
                $type_stmt->bindParam(':site_name', $site_name, PDO::PARAM_STR);
                $type_stmt->execute();
                $types = $type_stmt->fetchAll(PDO::FETCH_COLUMN);
              ?>
              <div class="dropdown w-100">
                <button class="btn btn-secondary dropdown-toggle w-100 d-flex align-items-center justify-content-between" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Select Type
                </button>
                <ul class="dropdown-menu w-100">
                  <?php foreach ($types as $type): ?>
                    <li class="dropdown-item">
                      <div class="form-check">
                        <input class="form-check-input type-filter" type="checkbox" name="type[]" 
                          id="type_<?php echo htmlspecialchars($type); ?>" 
                          value="<?php echo htmlspecialchars($type); ?>"
                          <?php echo (isset($_GET['type']) && in_array($type, $_GET['type'])) ? 'checked' : ''; ?>>
                        <label class="form-check-label w-100" for="type_<?php echo htmlspecialchars($type); ?>">
                          <?php echo htmlspecialchars($type); ?>
                        </label>
                      </div>
                    </li>
                  <?php endforeach; ?>
                </ul>
              </div>
            </div>

            <div class="status-wrapper">
              <?php
                // Get unique status values
                $status_sql = "SELECT DISTINCT status 
                             FROM animes a
                             JOIN sites s ON a.site_id = s.id
                             WHERE s.name = :site_name AND status IS NOT NULL
                             ORDER BY status";
                
                $status_stmt = $pdo->prepare($status_sql);
                $status_stmt->bindParam(':site_name', $site_name, PDO::PARAM_STR);
                $status_stmt->execute();
                $statuses = $status_stmt->fetchAll(PDO::FETCH_COLUMN);
              ?>
              <div class="dropdown w-100">
                <button class="btn btn-secondary dropdown-toggle w-100 d-flex align-items-center justify-content-between" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Select Status
                </button>
                <ul class="dropdown-menu w-100">
                  <?php foreach ($statuses as $status): ?>
                    <li class="dropdown-item">
                      <div class="form-check">
                        <input class="form-check-input status-filter" type="checkbox" name="status[]" 
                          id="status_<?php echo htmlspecialchars($status); ?>" 
                          value="<?php echo htmlspecialchars($status); ?>"
                          <?php echo (isset($_GET['status']) && in_array($status, $_GET['status'])) ? 'checked' : ''; ?>>
                        <label class="form-check-label w-100" for="status_<?php echo htmlspecialchars($status); ?>">
                          <?php echo htmlspecialchars($status); ?>
                        </label>
                      </div>
                    </li>
                  <?php endforeach; ?>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="anime-container col-12 col-lg-8 col-xl-9">
        <div class="row row-30">    
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

              // Add status filters if selected
              if (isset($_GET['status']) && !empty($_GET['status'])) {
                $status_placeholders = [];
                foreach ($_GET['status'] as $key => $status) {
                  $placeholder = ":status$key";
                  $status_placeholders[] = $placeholder;
                  $params[$placeholder] = $status;
                }
                $where_conditions[] = "animes.status IN (" . implode(',', $status_placeholders) . ")";
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
                  echo '<div class="anime-wrapper col-6 col-md-3 col-lg-4 col-xl-3">';
                  echo '<div class="anime" id="' . $anime['id']  . '">';  
                  echo '<div class="image"><img src="' . $anime['image_url'] . '" width="100"></div>';
                  echo '<div class="status"><span class="type">' . $anime['type'] . '</span>';
                  echo '<span class="type">' . $anime['status'] . '</span></div>';
                  echo '<div class="text">';
                  echo '<h2 class="h6">' . $anime['title'] . '</h2></div>';
                  echo '<button type="button" class="btn btn-link episodes viewEpisodes">Episodes</button>';
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
            <!-- Flecha izquierda -->
            <li class="page-item <?php echo ($current_page == 1) ? 'deactivate' : ''; ?>">
              <a class="page-link" href="<?php echo ($current_page > 1) ? $base_url . 'page=' . ($current_page - 1) : '#'; ?>">
                Prev
              </a>
            </li>

            <?php
              $total_visible = 5; // Número de páginas visibles en el medio
              $start = max(1, min($current_page - floor($total_visible/2), $total_pages - $total_visible + 1));
              $end = min($start + $total_visible - 1, $total_pages);
              
              // Primera página
              if ($start > 1) {
                echo '<li class="page-item ' . (1 == $current_page ? 'active' : '') . '">';
                echo '<a class="page-link" href="' . $base_url . 'page=1">1</a></li>';
                if ($start > 2) {
                  echo '<li class="page-item disabled"><span class="page-link">...</span></li>';
                }
              }

              // Páginas del medio
              for ($i = $start; $i <= $end; $i++) {
                echo '<li class="page-item ' . ($i == $current_page ? 'active' : '') . '">';
                echo '<a class="page-link" href="' . $base_url . 'page=' . $i . '">' . $i . '</a></li>';
              }

              // Última página
              if ($end < $total_pages) {
                if ($end < $total_pages - 1) {
                  echo '<li class="page-item disabled"><span class="page-link">...</span></li>';
                }
                echo '<li class="page-item ' . ($total_pages == $current_page ? 'active' : '') . '">';
                echo '<a class="page-link" href="' . $base_url . 'page=' . $total_pages . '">' . $total_pages . '</a></li>';
              }
            ?>

            <!-- Flecha derecha -->
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
</div>