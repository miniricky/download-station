<?php
require_once '../db.php';

$site_name = "animeflv";
$items_per_page = 24;
$current_page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$offset = ($current_page - 1) * $items_per_page;

try {
  $where_conditions = ["sites.name = :site_name"];
  $params = [':site_name' => $site_name];

  // Add search condition if search term exists
  if (isset($_GET['search']) && !empty($_GET['search'])) {
    $where_conditions[] = "animes.title LIKE :search";
    $params[':search'] = '%' . $_GET['search'] . '%';
  }

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

  // Add type filters if selected
  if (isset($_GET['type']) && !empty($_GET['type'])) {
    $type_placeholders = [];
    foreach ($_GET['type'] as $key => $type) {
      $placeholder = ":type$key";
      $type_placeholders[] = $placeholder;
      $params[$placeholder] = $type;
    }
    $where_conditions[] = "animes.type IN (" . implode(',', $type_placeholders) . ")";
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

  // Count query
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

  // Main query
  $sql = "SELECT DISTINCT animes.*, sites.name AS site_name, sites.url AS site_url,
          (SELECT COUNT(*) FROM anime_episodes WHERE anime_id = animes.id) as episode_count
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
  
  // Generate HTML content
  $content = '';
  if ($animes) {
    foreach ($animes as $anime) {
      $content .= '<div class="anime-wrapper col-6 col-md-3 col-lg-4 col-xl-3">';
      $content .= '<div class="anime" id="' . $anime['id'] . '">';
      $content .= '<div class="image"><img src="' . $anime['image_url'] . '" width="100">';
      $content .= '<span>' . $anime['episode_count'] . ' eps</span></div>';
      $content .= '<div class="status"><span class="type">' . $anime['type'] . '</span>';
      $content .= '<span class="type">' . $anime['status'] . '</span></div>';
      $content .= '<div class="text"><h2 class="h6">' . $anime['title'] . '</h2></div>';
      $content .= '<button type="button" class="btn btn-link viewEpisodes">Episodios</button>';
      $content .= "</div></div>";
    }
  } else {
    $content = "<div class='col-12'><p>No animes found.</p></div>";
  }

  // Generate pagination HTML
  $pagination = '<ul class="pagination">';
  
  // Prev button
  if ($current_page > 1) {
    $pagination .= '<li class="page-item"><a class="page-link" href="#" data-page="' . ($current_page - 1) . '">Prev</a></li>';
  } else {
    $pagination .= '<li class="page-item deactivate"><a class="page-link" href="#">Prev</a></li>';
  }

  $total_visible = 5; // Número de páginas visibles en el medio
  $start = max(1, min($current_page - floor($total_visible/2), $total_pages - $total_visible + 1));
  $end = min($start + $total_visible - 1, $total_pages);

  // First page
  if ($start > 1) {
    $pagination .= '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>';
    if ($start > 2) {
      $pagination .= '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }

  // Middle pages
  for ($i = $start; $i <= $end; $i++) {
    $active = $i == $current_page ? 'active' : '';
    $pagination .= '<li class="page-item ' . $active . '"><a class="page-link" href="#" data-page="' . $i . '">' . $i . '</a></li>';
  }

  // Last page
  if ($end < $total_pages) {
    if ($end < $total_pages - 1) {
      $pagination .= '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
    $pagination .= '<li class="page-item"><a class="page-link" href="#" data-page="' . $total_pages . '">' . $total_pages . '</a></li>';
  }

  // Next button
  if ($current_page < $total_pages) {
    $pagination .= '<li class="page-item"><a class="page-link" href="#" data-page="' . ($current_page + 1) . '">Next</a></li>';
  } else {
    $pagination .= '<li class="page-item deactivate"><a class="page-link" href="#">Next</a></li>';
  }
  $pagination .= '</ul>';

  // Get available genres
  $genres_sql = "SELECT DISTINCT ag.genre 
                 FROM anime_genres ag
                 JOIN animes a ON ag.anime_id = a.id
                 JOIN sites s ON a.site_id = s.id
                 WHERE s.name = :site_name";

  if (isset($_GET['search']) && !empty($_GET['search'])) {
    $genres_sql .= " AND a.title LIKE :search_term";
  }

  $genres_sql .= " ORDER BY ag.genre";

  $genres_stmt = $pdo->prepare($genres_sql);
  $genres_stmt->bindValue(':site_name', $site_name);
  if (isset($_GET['search']) && !empty($_GET['search'])) {
    $genres_stmt->bindValue(':search_term', '%' . $_GET['search'] . '%');
  }
  $genres_stmt->execute();
  $available_genres = $genres_stmt->fetchAll(PDO::FETCH_COLUMN);

  // Get available types (existing code)
  $types_sql = "SELECT DISTINCT type 
                FROM animes a
                JOIN sites s ON a.site_id = s.id
                WHERE s.name = :site_name 
                AND type IS NOT NULL";

  if (isset($_GET['search']) && !empty($_GET['search'])) {
    $types_sql .= " AND a.title LIKE :search_term";
  }

  $types_sql .= " ORDER BY type";

  $types_stmt = $pdo->prepare($types_sql);
  $types_stmt->bindValue(':site_name', $site_name);
  if (isset($_GET['search']) && !empty($_GET['search'])) {
    $types_stmt->bindValue(':search_term', '%' . $_GET['search'] . '%');
  }
  $types_stmt->execute();
  $available_types = $types_stmt->fetchAll(PDO::FETCH_COLUMN);

  // Single JSON response with all data
  echo json_encode([
    'content' => $content,
    'pagination' => $pagination,
    'total' => $total_rows,
    'available_genres' => $available_genres,
    'available_types' => $available_types
  ]);

} catch (PDOException $e) {
  echo json_encode(['error' => $e->getMessage()]);
}