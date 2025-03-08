<?php
header('Content-Type: application/json');

$nodeServer = $_SERVER['HTTP_HOST'] === 'download-station.test'
    ? 'http://localhost:3000'
    : 'http://192.168.1.69:3000';

$endpoint = $_GET['endpoint'] ?? '';
$page = $_GET['page'] ?? '';
$status = $_GET['status'] ?? '';
$firstRequest = isset($_GET['firstRequest']) ? '&firstRequest=true' : '';

$url = "{$nodeServer}/scrape/{$endpoint}?page={$page}&status={$status}{$firstRequest}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;