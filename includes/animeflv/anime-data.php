<?php
require_once '../db.php';

$anime_id = isset($_GET['anime_id']) ? (int) $_GET['anime_id'] : 1;

if ($anime_id > 0) {
  $anime = getAnimeDetails($pdo, $anime_id);
  if ($anime) {
    echo json_encode($anime);
  } else {
    echo json_encode(["error" => "Anime no encontrado"]);
  }
} else {
  echo json_encode(["error" => "ID no válido"]);
}

function getAnimeDetails($pdo, $anime_id) {
  $sql = "
    SELECT 
        a.title, 
        a.image_url, 
        a.synopsis, 
        a.type, 
        a.status,
        GROUP_CONCAT(DISTINCT g.genre ORDER BY g.genre ASC) AS genres
    FROM animes a
    LEFT JOIN anime_genres g ON a.id = g.anime_id
    WHERE a.id = :anime_id
    GROUP BY a.id";

  $stmt = $pdo->prepare($sql);
  $stmt->bindParam(':anime_id', $anime_id, PDO::PARAM_INT);
  $stmt->execute();
  $anime = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$anime) {
    return null;
  }

  $sqlEpisodes = "SELECT episode_number, link FROM anime_episodes WHERE anime_id = :anime_id ORDER BY episode_number ASC";
  $stmt = $pdo->prepare($sqlEpisodes);
  $stmt->bindParam(':anime_id', $anime_id, PDO::PARAM_INT);
  $stmt->execute();
  $episodes = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $anime['episodes'] = $episodes;

  return $anime;
}
?>