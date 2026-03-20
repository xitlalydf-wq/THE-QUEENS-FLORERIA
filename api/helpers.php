<?php

function jsonResponse($data, int $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function badRequest(string $message) {
    jsonResponse(['error' => $message], 400);
}

function notFound(string $message = 'No encontrado') {
    jsonResponse(['error' => $message], 404);
}

function methodNotAllowed(string $message = 'Método no permitido') {
    jsonResponse(['error' => $message], 405);
}

function getJsonBody() {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return null;
    }

    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }

    return $decoded;
}

function getPathParts(): array {
    // Trata de usar PATH_INFO si está disponible (mod_rewrite con /file.php/extra)
    $pathInfo = $_SERVER['PATH_INFO'] ?? '';

    if ($pathInfo) {
        return array_values(array_filter(explode('/', trim($pathInfo, '/'))));
    }

    // Si no está PATH_INFO, intenta extraerlo de REQUEST_URI
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $script = $_SERVER['SCRIPT_NAME'];

    // Elimina la parte del script de la URI, incluyendo casos de mod_rewrite api/endpoint -> api/endpoint.php
    if (strpos($uri, $script) === 0) {
        $uri = substr($uri, strlen($script));
    } else {
        // Si la ruta es /api/endpoint y se está ejecutando api/endpoint.php, ajusta consistentemente
        $scriptBase = dirname($script);
        $scriptName = basename($script, '.php');
        $prefix = rtrim($scriptBase, '/') . '/' . $scriptName;

        if (strpos($uri, $prefix) === 0) {
            $uri = substr($uri, strlen($prefix));
        }
    }

    return array_values(array_filter(explode('/', trim($uri, '/'))));
}
