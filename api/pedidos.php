<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $query = "
        SELECT p.Id_pedido, p.Id_cliente, c.Nombre AS Cliente, p.Fecha, p.Estado, p.Total, p.Notas
        FROM pedidos p
        JOIN clientes c ON p.Id_cliente = c.Id_cliente
        ORDER BY p.Fecha DESC
    ";

    $stmt = $pdo->query($query);
    $rows = $stmt->fetchAll();
    jsonResponse($rows);
}

if ($method === 'POST') {
    // Llevar solo total al pedido (sin ticket de producto)
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) {
        badRequest('Cuerpo JSON no válido');
    }

    $total = isset($body['total']) ? floatval($body['total']) : 0;
    if ($total <= 0) {
        badRequest('Total debe ser mayor a 0');
    }

    $id_cliente = isset($body['id_cliente']) ? intval($body['id_cliente']) : 1;
    $estado = $body['estado'] ?? 'Pendiente';
    $notas = trim($body['notas'] ?? '');
    $fecha = date('Y-m-d H:i:s');

    $stmt = $pdo->prepare('INSERT INTO pedidos (Id_cliente, Fecha, Estado, Total, Notas) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$id_cliente, $fecha, $estado, $total, $notas]);

    jsonResponse(['message' => 'Pedido creado', 'Id_pedido' => (int)$pdo->lastInsertId()], 201);
}

methodNotAllowed();
