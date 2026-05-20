<?php

$allowed_sections = ['quiz','lab','test','project'];

$section = basename($_GET['section']);
$file = basename($_GET['file']);

if (!in_array($section, $allowed_sections)) {
    http_response_code(403);
    exit("Access denied");
}

$base = "/var/www/private_data/";
$path = $base . $section . "/" . $file;

if (!file_exists($path)) {
    http_response_code(404);
    exit("File not found");
}

header("Content-Type: application/json");
echo file_get_contents($path);
