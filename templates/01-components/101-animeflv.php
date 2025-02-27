<div class="section-row" id="animeflv">
  <div class="container-fluid">
    <div class="search-container">
      <label for="animeSearch" class="form-label">Search</label>
      <input class="form-control" type="search" id="animeSearch" placeholder="Type to search..." autocomplete="off">
    </div>

    <div class="anime-container row row-30">
      <?php
          require_once 'includes/db.php';
          $site_name = "animeflv";
          $items_per_page = 24;
          
          $current_page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
          $offset = ($current_page - 1) * $items_per_page;

          try {
              $count_sql = "SELECT COUNT(*) as total FROM animes JOIN sites ON animes.site_id = sites.id WHERE sites.name = :site_name";
              $count_stmt = $pdo->prepare($count_sql);
              $count_stmt->bindParam(':site_name', $site_name, PDO::PARAM_STR);
              $count_stmt->execute();
              $total_rows = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
              $total_pages = ceil($total_rows / $items_per_page);

              $sql = "SELECT animes.*, sites.name AS site_name, sites.url AS site_url
                      FROM animes
                      JOIN sites ON animes.site_id = sites.id
                      WHERE sites.name = :site_name
                      LIMIT :limit OFFSET :offset";
              
              $stmt = $pdo->prepare($sql);
              $stmt->bindParam(':site_name', $site_name, PDO::PARAM_STR);
              $stmt->bindParam(':limit', $items_per_page, PDO::PARAM_INT);
              $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
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
    
    <div class="pagination-row">
      <nav arial-label="Page navigation">
        <ul class="pagination">
          <li class="page-item <?php echo ($current_page == 1) ? 'deactivate' : ''; ?>">
            <a class="page-link" href="<?php echo ($current_page > 1) ? '?page=' . ($current_page - 1) : '#'; ?>">
              Prev
            </a>
          </li>

          <?php for ($i = 1; $i <= $total_pages; $i++): ?>
            <li class="page-item <?php echo ($i == $current_page) ? 'active' : ''; ?>">
              <a class="page-link" href="?page=<?php echo $i; ?>">
                <?php echo $i; ?>
              </a>
            </li>
          <?php endfor; ?>

          <li class="page-item <?php echo ($current_page == $total_pages) ? 'deactivate' : ''; ?>">
            <a class="page-link" href="<?php echo ($current_page < $total_pages) ? '?page=' . ($current_page + 1) : '#'; ?>">
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</div>