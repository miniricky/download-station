<?php
require_once 'db.php';

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new Exception('Invalid request method');
  }

  if (empty($_POST['name']) || empty($_POST['url'])) {
    throw new Exception('Name and URL are required');
  }

  $name = $_POST['name'];
  $url = $_POST['url'];
  
  // Check if site name already exists
  $sql = "SELECT COUNT(*) FROM sites WHERE name = :name";
  $stmt = $pdo->prepare($sql);
  $stmt->execute(['name' => $name]);
  if ($stmt->fetchColumn() > 0) {
    throw new Exception('Site name already exists');
  }

  $image_url = null;

  // Handle image upload
  if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/images/sites/';
    if (!is_dir($upload_dir)) {
      mkdir($upload_dir, 0777, true);
    }

    $file_extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $file_name = strtolower(preg_replace('/[^a-zA-Z0-9\.]/', '-', $name));
    $file_name = preg_replace('/-+/', '-', $file_name);
    $image_path = $upload_dir . $file_name . '.' . $file_extension;
    
    if (move_uploaded_file($_FILES['image']['tmp_name'], $image_path)) {
      $image_url = 'images/sites/' . $file_name . '.' . $file_extension;
    }
  }

  // Insert into database
  $sql = "INSERT INTO sites (name, url, image_url) VALUES (:name, :url, :image_url)";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    'name' => $name,
    'url' => $url,
    'image_url' => $image_url
  ]);

  echo json_encode([
    'status' => 'success',
    'message' => 'Site added successfully'
  ]);
} catch (Exception $e) {
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
?>