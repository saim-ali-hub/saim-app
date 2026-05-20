<?php

$action = $_GET['action'] ?? '';

if ($action === "quiz") {
    require "/var/www/private_data/validator/evaluate_quiz.php";
    exit;
}

if ($action === "lab") {
    require "/var/www/private_data/validator/evaluate_lab.php";
    exit;
}

echo "Invalid action";
