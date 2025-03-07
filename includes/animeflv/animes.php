<?php
require_once '../db.php';

$site_id = getAnimeID($pdo, 'animeflv');
if (!$site_id) {
  echo json_encode([
    "status" => "error",
    "message" => "Site not found, you can add it"
  ]);
  exit;
}

$status = isset($_GET['status']) ? $_GET['status'] : 'finished';
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$firstRequest = isset($_GET['firstRequest']) ? true : false;

switch ($status) {
  case 'onAir':
    $url = 'https://www3.animeflv.net/browse?status%5B%5D=1&order=default';
    $status = 'On Air';
    break;
  case 'finished':
    $url = 'https://www3.animeflv.net/browse?status%5B%5D=2&order=default';
    $status = 'Finished';
    break;
}

/* 
 * Fetch total pages only on first request
 */
if ($firstRequest) {
  $xpath = curl($url);
  $pagination_query = "//ul[contains(@class, 'pagination')]/li[last()-1]/a/@href";
  $pages = $xpath->query($pagination_query);
  $href = ($pages->length > 0) ? $pages->item(0)->nodeValue : '';
  preg_match('/page=(\d+)/', $href, $matches);
  $totalPages = isset($matches[1]) ? (int) $matches[1] : 1;

  echo json_encode([
    "status" => $status,
    "totalPages" => $totalPages,
    "message" => "Total pages obtained: $totalPages"
  ]);
  exit;
}

$url .= "&page=$page";
$result = getAnimes($pdo, $url, $site_id, $status);

echo json_encode([
  "page" => $page,
  "status" => $status,
  "message" => $result ? "Page $page processed" : "No more pages",
  "nextPage" => $result ? $page + 1 : null
]);

exit;

/* 
 * Function get Anime ID
 */
function getAnimeID($pdo, $siteName) {
  $sql = "SELECT id FROM sites WHERE name = :name";
  $stmt = $pdo->prepare($sql);
  $stmt->bindParam(':name', $siteName, PDO::PARAM_STR);
  $stmt->execute();
  return $stmt->fetchColumn();
}

/* 
 * Function for curl http
 */
function curl($url) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_HEADER, false); // dont return headers
  curl_setopt($ch, CURLOPT_NOBODY, false); // wants to return body
  curl_setopt($ch, CURLOPT_TIMEOUT, 10); // maximum time to wait for response

  $response = curl_exec($ch);
  
  // get the http code
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($httpCode >= 400) {
    return false;
  }

  $dom = new DOMDocument();
  @$dom->loadHTML($response);
  $xpath = new DOMXPath($dom);
  return $xpath;
}

/* 
 * Function for get animes
 */
function getAnimes($pdo, $url, $site_id, $status) {
  $xpath = curl($url);

  if (!$xpath) {
    return false;
  }

  $articles = $xpath->query("//article");

  if ($articles->length === 0) return false;

  foreach ($articles as $article) {
    $titleNode = $xpath->query(".//div[contains(@class, 'Title')]", $article);
    $typeNode = $xpath->query(".//p/span[contains(@class, 'Type')]", $article);
    $linkNode = $xpath->query(".//a[contains(@class, 'Vrnmlk')]/@href", $article);
    $urlNode = $xpath->query(".//div/figure/img/@src", $article);

    if ($titleNode->length > 0 && $typeNode->length > 0 && $linkNode->length > 0 && $urlNode->length > 0) {
      $title = trim($titleNode->item(0)->nodeValue);
      $type = trim($typeNode->item(0)->nodeValue);
      $link = 'https://www3.animeflv.net/' . trim($linkNode->item(0)->nodeValue);
      $urlImage = trim($urlNode->item(0)->nodeValue);
      saveAnime($pdo, $title, $type, $link, $urlImage, $site_id, $status);
    }
  }

  return true;
}

/* 
 * Function for save animes
 */
function saveAnime($pdo, $title, $type, $link, $urlImage, $site_id, $status) {
  try {
    $sql = "SELECT id FROM animes WHERE link = :link";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(["link" => $link]);
    $anime = $stmt->fetch(PDO::FETCH_ASSOC);
    $pdo->beginTransaction();

    if (!$anime) {
      $imagePath = __DIR__ . '/images/';
      $imageSaved = downloadImage($urlImage, $imagePath, $title);

      $extraData = getAnimeDetails($link);
      $synopsis = $extraData['data']['synopsis'];
      $episodes = $extraData['data']['episodes'];
      $genres = $extraData['data']['genres'];

      $sql = "INSERT INTO animes (site_id, title, type, link, image_url, synopsis, status) VALUES (:site_id, :title, :type, :link, :image_url, :synopsis, :status)";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        "site_id" => $site_id,
        "title" => $title,
        "type" => $type,
        "link" => $link,
        "image_url" => $imageSaved,
        "synopsis" => $synopsis,
        "status" => $status
      ]);
      $anime_id = $pdo->lastInsertId();
    } else {
      $anime_id = $anime['id'];
      $extraData = getAnimeDetails($link);
      $episodes = $extraData['data']['episodes'];
    }

    // Processing episodes for new and existing anime
    foreach ($episodes as $key => $episode) {
      $episode_number = $key + 1;
      $streamtapeLink = scrapingEpisode($episode['link']);
      
      // Check if the episode exists
      $sql = "SELECT id, link FROM anime_episodes WHERE anime_id = :anime_id AND episode_number = :episode_number";
      $stmt = $pdo->prepare($sql);
      $stmt->execute([
        "anime_id" => $anime_id,
        "episode_number" => $episode_number
      ]);
      $existingEpisode = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$existingEpisode) {
        // Insert new episode
        $sql = "INSERT INTO anime_episodes (anime_id, episode_number, link) VALUES (:anime_id, :episode_number, :link)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
          "anime_id" => $anime_id,
          "episode_number" => $episode_number,
          "link" => $streamtapeLink
        ]);
      } else if ($existingEpisode['link'] !== $streamtapeLink && $streamtapeLink !== null) {
        // Update link if different and valid
        $sql = "UPDATE anime_episodes SET link = :link WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
          "id" => $existingEpisode['id'],
          "link" => $streamtapeLink
        ]);
      }
    }

    // Process genres only for new anime
    if (!$anime && isset($genres)) {
      foreach ($genres as $genre) {
        $sql = "INSERT INTO anime_genres (anime_id, genre) VALUES (:anime_id, :genre)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
          "anime_id" => $anime_id,
          "genre" => $genre
        ]);
      }
    }

    $pdo->commit();
  } catch (PDOException $e) {
    if ($pdo->inTransaction()) {
      $pdo->rollBack();
    }

    echo "Error saving anime: " . $e->getMessage();
  }
}

/* 
 * Function for download images
 */
function downloadImage($url, $directory, $title) {
  if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
  }

  $title = strtolower($title);
  $fileName = preg_replace('/[^a-zA-Z0-9\.]/', '-', $title);
  $fileName = preg_replace('/-+/', '-', $fileName);
  $fullPath = $directory . $fileName. '.jpg';

  $image = file_get_contents($url);
  if ($image !== false) {
    file_put_contents($fullPath, $image);
    return 'includes/animeflv/images/' . $fileName . '.jpg';
  } else {
    return null;
  }
}

/* 
 * Function for get anime details
 */
function getAnimeDetails($animeUrl) {
  $nodeServer = $_SERVER['HTTP_HOST'] === 'download-station.test' 
    ? "http://localhost:3000/scrape/anime"
    : "http://192.168.1.69:3000/scrape/anime";

  $postData = json_encode(["url" => $animeUrl]);

  $ch = curl_init($nodeServer);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
  curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

  $response = curl_exec($ch);
  curl_close($ch);

  return json_decode($response, true);
}

/*
 * Function for scraping episodes.
 */
function scrapingEpisode($url) {
  $xpath = curl($url);

  if (!$xpath) {
    return false;
  }

  $articles = $xpath->query("//a[contains(@class, 'Button') and contains(@class, 'Sm') and contains(@class, 'fa-download')]/@href");
  if ($articles->length > 0) {
    foreach ($articles as $article) {
      $link = $article->nodeValue;

      if (strpos($link, 'https://streamtape.com/') !== false) {
        return $link;
      }
    }
  }

  return null;
}
?>