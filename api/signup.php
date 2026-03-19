<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$body = getJsonBody();
if (!$body || empty($body['nombre']) || empty($body['correo']) || empty($body['contrasena'])) {
    badRequest('Nombre, correo y contraseña son requeridos');
}

$nombre = trim($body['nombre']);
$correo = trim($body['correo']);
$contrasena = $body['contrasena'];

// Verificar si ya existe el correo
$stmt = $pdo->prepare('SELECT Id_cliente FROM clientes WHERE Correo = ? LIMIT 1');
$stmt->execute([$correo]);
if ($stmt->fetch()) {
    http_response_code(409);
    jsonResponse(['error' => 'El correo ya está registrado']);
}

$stmt = $pdo->prepare('SELECT Id_admin FROM administradores WHERE Correo = ? LIMIT 1');
$stmt->execute([$correo]);
if ($stmt->fetch()) {
    http_response_code(409);
    jsonResponse(['error' => 'El correo ya está registrado']);
}

$hash = password_hash($contrasena, PASSWORD_BCRYPT);

$stmt = $pdo->prepare('INSERT INTO clientes (Nombre, Correo, Contrasena) VALUES (?, ?, ?)');
$stmt->execute([$nombre, $correo, $hash]);

jsonResponse(['success' => true, 'message' => 'Cuenta creada exitosamente']);
