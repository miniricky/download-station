<?php
require_once '../db.php';

$search = isset($_GET['q']) ? $_GET['q'] : '';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$items_per_page = 24;
$offset = ($page - 1) * $items_per_page;
$site_name = "animeflv";

try {
  // Count total results
  $count_sql = "SELECT COUNT(*) as total 
                FROM animes 
                JOIN sites ON animes.site_id = sites.id 
                WHERE sites.name = :site_name 
                AND (animes.title LIKE :search OR animes.type LIKE :search)";
  
  $count_stmt = $pdo->prepare($count_sql);
  $count_stmt->bindValue(':site_name', $site_name);
  $count_stmt->bindValue(':search', "%$search%");
  $count_stmt->execute();
  $total_rows = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
  $total_pages = ceil($total_rows / $items_per_page);

  // Get results
  $sql = "SELECT animes.*, sites.name AS site_name, sites.url AS site_url
          FROM animes
          JOIN sites ON animes.site_id = sites.id
          WHERE sites.name = :site_name 
          AND (animes.title LIKE :search OR animes.type LIKE :search)
          LIMIT :limit OFFSET :offset";
  
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':site_name', $site_name);
  $stmt->bindValue(':search', "%$search%");
  $stmt->bindValue(':limit', $items_per_page, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  
  $animes = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  $html = '';
  
  if ($animes) {
    foreach ($animes as $anime) {
      $html .= '<div class="anime-wrapper col-6 col-md-3 col-lg-4 col-xl-3">';
      $html .= '<div class="anime" id="' . $anime['id'] . '">';
      $html .= '<div class="image"><img src="' . $anime['image_url'] . '" width="100"></div>';
      $html .= '<div class="status"><span class="type">' . $anime['type'] . '</span>';
      $html .= '<span class="type">' . $anime['status'] . '</span></div>';
      $html .= '<div class="text">';
      $html .= '<h2 class="h6">' . $anime['title'] . '</h2></div>';
      $html .= '<button type="button" class="btn btn-link viewChapters">Charapters</button>';
      $html .= "</div></div>";
    }
  } else {
    $html = "<div class='col-12'><p>No results found.</p></div>";
  }

  // Pagination HTML
  $pagination = '<ul class="pagination">';
  if ($page > 1) {
    $pagination .= '<li class="page-item"><a class="page-link" href="#" data-page="' . ($page - 1) . '">Prev</a></li>';
  } else {
    $pagination .= '<li class="page-item deactivate"><a class="page-link" href="#">Prev</a></li>';
  }
  
  for ($i = 1; $i <= $total_pages; $i++) {
    $active = $i == $page ? 'active' : '';
    $pagination .= '<li class="page-item ' . $active . '"><a class="page-link" href="#" data-page="' . $i . '">' . $i . '</a></li>';
  }
  
  if ($page < $total_pages) {
    $pagination .= '<li class="page-item"><a class="page-link" href="#" data-page="' . ($page + 1) . '">Next</a></li>';
  } else {
    $pagination .= '<li class="page-item deactivate"><a class="page-link" href="#">Next</a></li>';
  }
  $pagination .= '</ul>';

  echo json_encode([
    'content' => $html,
    'pagination' => $pagination,
    'total' => $total_rows
  ]);

} catch (PDOException $e) {
  echo json_encode(['error' => $e->getMessage()]);
}