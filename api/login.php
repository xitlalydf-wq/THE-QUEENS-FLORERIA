<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$body = getJsonBody();
if (!$body || empty($body['correo']) || empty($body['contrasena'])) {
    badRequest('Correo y contraseña son requeridos');
}

$correo = trim($body['correo']);
$contrasena = $body['contrasena'];

// Buscar en clientes
$stmt = $pdo->prepare('SELECT Id_cliente AS id, Nombre, Contrasena, ? AS role FROM clientes WHERE Correo = ? LIMIT 1');
$stmt->execute(['cliente', $correo]);
$user = $stmt->fetch();

if (!$user) {
    // Buscar en administradores
    $stmt = $pdo->prepare('SELECT Id_admin AS id, Nombre, Contrasena, ? AS role FROM administradores WHERE Correo = ? LIMIT 1');
    $stmt->execute(['admin', $correo]);
    $user = $stmt->fetch();
}

if (!$user) {
    http_response_code(401);
    jsonResponse(['error' => 'Correo o contraseña incorrectos']);
}

$hash = $user['Contrasena'] ?? '';
if (!password_verify($contrasena, $hash)) {
    http_response_code(401);
    jsonResponse(['error' => 'Correo o contraseña incorrectos']);
}

// Generar token simple (no válido para seguridad real)
$token = bin2hex(random_bytes(16));

jsonResponse([
    'success' => true,
    'token' => $token,
    'role' => $user['role'],
    'nombre' => $user['Nombre'],
    'id' => (int) $user['id'],
]);
