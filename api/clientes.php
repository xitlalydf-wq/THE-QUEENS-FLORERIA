<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

$filter = $_GET['filter'] ?? '';

$query = "
    SELECT c.Id_cliente, c.Nombre, c.Correo, c.Telefono,
           COUNT(p.Id_pedido) AS Pedidos,
           COALESCE(SUM(p.Total), 0) AS TotalComprado,
           MAX(p.Fecha) AS UltimaCompra,
           MIN(p.Fecha) AS PrimeraCompra
    FROM clientes c
    LEFT JOIN pedidos p ON c.Id_cliente = p.Id_cliente
    GROUP BY c.Id_cliente, c.Nombre, c.Correo, c.Telefono
";

if ($filter === 'frecuentes') {
    $query .= " HAVING COUNT(p.Id_pedido) > 5";
} elseif ($filter === 'nuevos') {
    $query .= " HAVING MIN(p.Fecha) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
} elseif ($filter === 'recientes') {
    $query .= " HAVING MAX(p.Fecha) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
}

$query .= " ORDER BY c.Nombre";

$stmt = $pdo->query($query);
$rows = $stmt->fetchAll();
jsonResponse($rows);
