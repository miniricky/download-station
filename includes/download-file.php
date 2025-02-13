<?php
$url = isset($_GET['url']) ? $_GET['url'] : 'default-title';
$fileName = isset($_GET['filename']) ? $_GET['filename'] : 'default-file.mp4';

header('Content-Type: application/octet-stream');
header('Content-Transfer-Encoding: chunked');
header('Content-disposition: attachment; filename="' . $fileName . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');

ob_end_clean(); 

if (str_ends_with($url, ".json") || str_ends_with($url, ".xml")) {
  header('Content-Encoding: gzip');
  $file = fopen($url, 'rb');
  if ($file) {
    $gz = gzopen('php://output', 'wb9');
    while (!feof($file)) {
      gzwrite($gz, fread($file, 8192));
    }
    fclose($file);
    gzclose($gz);
  }
} else {
  readfile($url);
}