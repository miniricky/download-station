<?php
$url = isset($_GET['url']) ? $_GET['url'] : 'default-title';
$fileName = isset($_GET['filename']) ? $_GET['filename'] : 'default-file.mp4';

header('Content-Type: application/octet-stream');
header('Content-Transfer-Encoding: Binary');
header('Content-disposition: attachment; filename="' . $fileName . '"');

readfile($url);