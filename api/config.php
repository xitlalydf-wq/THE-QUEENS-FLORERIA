<?php
/**
 * Configuración de conexión a base de datos.
 *
 * Edita estos valores según tu entorno (InfinityFree / local).
 * En hosting como InfinityFree puedes obtener el host, usuario y base de datos
 * desde el panel de control.
 */

// Carga un archivo .env si existe (útil para desarrollo local)
$possibleEnvPaths = [
    dirname(__DIR__) . '/.env',       // raíz del proyecto
    dirname(__DIR__) . '/Backend/.env' // carpeta Backend (como estaba antes)
];

foreach ($possibleEnvPaths as $envPath) {
    if (!file_exists($envPath)) {
        continue;
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        [$key, $value] = array_map('trim', explode('=', $line, 2) + [1 => '']);
        if ($key !== '') {
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
    // solo carga el primero que exista
    break;
}

$DB_HOST = getenv('DB_HOST') ?: 'sql312.infinityfree.com';
$DB_PORT = getenv('DB_PORT') ?: '3306';
$DB_NAME = getenv('DB_DATABASE') ?: 'if0_41434539_db_the_queens_floreria';
$DB_USER = getenv('DB_USER') ?: 'if0_41434539';
$DB_PASS = getenv('DB_PASSWORD') ?: 'yNsMw4cdulM';

// Debug de conectividad TCP a MySQL (puedes quitar este bloque en producción).
$connectionCheck = @fsockopen($DB_HOST, $DB_PORT, $errno, $errstr, 5);
if (!$connectionCheck) {
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo conectar al servidor MySQL (TCP)',
        'detail' => "$errno: $errstr",
        'DB_HOST' => $DB_HOST,
        'DB_PORT' => $DB_PORT,
        'DB_DATABASE' => $DB_NAME,
        'DB_USER' => $DB_USER,
    ]);
    exit;
} else {
    fclose($connectionCheck);
}

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo conectar a la base de datos',
        'detail' => $e->getMessage()
    ]);
    exit;
}
