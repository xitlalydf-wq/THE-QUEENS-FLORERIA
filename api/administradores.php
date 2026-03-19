<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$stmt = $pdo->query('SELECT Id_admin, Nombre, Correo FROM administradores');
$rows = $stmt->fetchAll();
jsonResponse($rows);
