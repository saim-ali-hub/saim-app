<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: text/plain");

/* 1. READ INPUT */
$rawInput = file_get_contents("php://input");

/* 2. DEBUG */
file_put_contents(
    "/var/www/private_data/lab/results/debug.txt",
    "RAW INPUT:\n$rawInput\n\n",
    FILE_APPEND
);

/* 3. DECODE JSON */
$input = json_decode($rawInput, true);

if (!$input) {
    echo "Invalid JSON input";
    exit;
}

/* 4. EXTRACT VALUES */
$lab  = $input['lab'] ?? '';
$user = $input['user'] ?? '';

/* 5. REMOVE .json SAFELY */
$lab = basename($lab, ".json");

/* 6. DEBUG */
file_put_contents(
    "/var/www/private_data/lab/results/debug.txt",
    "PARSED:\n" . print_r($input, true) . "\nLAB=$lab USER=$user\n\n",
    FILE_APPEND
);

/* 7. VALIDATION */
if (!$lab || !$user) {
    http_response_code(400);
    echo "Missing lab or user";
    exit;
}

if (!preg_match('/^[a-zA-Z0-9_-]+$/', $user)) {
    die("Invalid username format");
}

if (!preg_match('/^lab[0-9]+$/', $lab)) {
    die("Invalid lab format: $lab");
}

if (!file_exists("/home/$user")) {
    die("User does not exist");
}

$blocked_users = ['root','apache','nginx','mysql','bin','daemon'];

if (in_array($user, $blocked_users)) {
    die("System users not allowed");
}

/* 8. EXECUTE */
$cmd = "sudo -n /usr/bin/bash /var/www/private_data/lab/validate_lab.sh $lab $user 2>&1";

exec($cmd, $output, $status);

echo implode("\n", $output);
?>
