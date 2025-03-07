<?php
header('Content-Type: application/json');

if (!isset($_POST['url'])) {
    http_response_code(400);
    echo json_encode(['error' => 'URL is required']);
    exit;
}

$scrapeUrl = $_POST['url'];
$nodeServer = $_SERVER['HTTP_HOST'] === 'download-station.test'
    ? 'http://localhost:3000/scrape/streamtape'
    : 'http://192.168.1.69:3000/scrape/streamtape';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $nodeServer);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['url' => $scrapeUrl]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 404) {
    http_response_code(404);
    echo json_encode(['error' => 'Video is unreachable']);
    exit;
}

if ($httpCode === 400) {
    http_response_code(400);
    echo json_encode(['error' => 'Page is unreachable']);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Bad Request']);
    exit;
}

echo $response;