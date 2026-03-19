<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$query = "
    SELECT p.Id_pedido, p.Id_cliente, c.Nombre AS Cliente, p.Fecha, p.Estado, p.Total, p.Notas
    FROM pedidos p
    JOIN clientes c ON p.Id_cliente = c.Id_cliente
    ORDER BY p.Fecha DESC
";

$stmt = $pdo->query($query);
$rows = $stmt->fetchAll();
jsonResponse($rows);
