<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

function normalizeTipo(string $tipo): string {
    $tipo = strtolower(trim($tipo));
    if (in_array($tipo, ['ramo', 'ramos'], true)) return 'ramos';
    if (in_array($tipo, ['accesorio', 'accesorios'], true)) return 'accesorios';
    if (in_array($tipo, ['decorativo', 'decorativos'], true)) return 'decorativos';
    return '';
}

function getIdColumnForTable(string $table): string {
    return match ($table) {
        'ramos' => 'Id_ramo',
        'accesorios' => 'Id_accesorio',
        'decorativos' => 'Id_decorativo',
        default => 'Id',
    };
}

function buildProductRow(array $row, string $table): array {
    $idCol = getIdColumnForTable($table);
    return [
        'tipo' => $table,
        'id' => (int) $row[$idCol],
        'Nombre' => $row['Nombre'] ?? '',
        'Precio' => (float) $row['Precio'],
        'descripcion' => $row['Descripcion'] ?? '',
        'Stock' => (int) $row['Stock'],
        'ImagenURL' => $row['ImagenURL'] ?? '',
        'Categoria' => $row['Categoria'] ?? '',
    ];
}

function handleGet(PDO $pdo) {
    $parts = getPathParts();

    if (count($parts) >= 2) {
        $tipo = normalizeTipo($parts[0]);
        $id = intval($parts[1]);
        if (!$tipo || $id <= 0) {
            badRequest('Tipo o id inválido');
        }

        $table = $tipo;
        $idCol = getIdColumnForTable($table);

        $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE `$idCol` = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            notFound('Producto no encontrado');
        }

        jsonResponse(buildProductRow($row, $table));
    }

    // Lista completa
    $query = "
        SELECT 'ramos' AS tipo, Id_ramo AS id, Nombre, Precio, Descripcion, Stock, COALESCE(ImagenURL, '') AS ImagenURL, COALESCE(Categoria, 'Ramos') AS Categoria
        FROM ramos
        UNION ALL
        SELECT 'accesorios' AS tipo, Id_accesorio AS id, Nombre, Precio, Descripcion, Stock, COALESCE(ImagenURL, '') AS ImagenURL, COALESCE(Categoria, 'Accesorios') AS Categoria
        FROM accesorios
        UNION ALL
        SELECT 'decorativos' AS tipo, Id_decorativo AS id, Nombre, Precio, Descripcion, Stock, COALESCE(ImagenURL, '') AS ImagenURL, COALESCE(Categoria, 'Decorativos') AS Categoria
        FROM decorativos
        ORDER BY Nombre;
    ";

    $stmt = $pdo->query($query);
    $rows = $stmt->fetchAll();

    // Aseguramos que el formato de cada fila sea uniforme
    $productos = array_map(function ($r) {
        return [
            'tipo' => $r['tipo'],
            'id' => (int) $r['id'],
            'Nombre' => $r['Nombre'] ?? '',
            'Precio' => (float) $r['Precio'],
            'descripcion' => $r['Descripcion'] ?? '',
            'Stock' => (int) $r['Stock'],
            'ImagenURL' => $r['ImagenURL'] ?? '',
            'Categoria' => $r['Categoria'] ?? '',
        ];
    }, $rows);

    jsonResponse($productos);
}

function handlePost(PDO $pdo) {
    // Crear producto (acepta form-data con posible archivo image)
    $tipo = $_POST['tipo'] ?? '';
    $table = normalizeTipo($tipo);
    if (!$table) {
        badRequest('Tipo de producto inválido');
    }

    $nombre = trim($_POST['nombre'] ?? '');
    $precio = floatval($_POST['precio'] ?? 0);
    $stock = intval($_POST['stock'] ?? 0);
    $descripcion = trim($_POST['descripcion'] ?? '');
    $categoria = trim($_POST['categoria'] ?? '');
    $imagenURL = trim($_POST['imagenURL'] ?? '');

    if (!$nombre) {
        badRequest('Nombre requerido');
    }

    // Manejo de archivo (si se subió uno)
    if (!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = dirname(__DIR__) . '/images';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
        $filename = time() . '-' . bin2hex(random_bytes(6)) . ($ext ? '.' . $ext : '');
        $target = $uploadDir . '/' . $filename;
        if (move_uploaded_file($_FILES['imagen']['tmp_name'], $target)) {
            $imagenURL = '/images/' . $filename;
        }
    }

    $idCol = getIdColumnForTable($table);

    $stmt = $pdo->prepare(
        "INSERT INTO `$table` (Nombre, Precio, Stock, Descripcion, ImagenURL, Categoria) VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$nombre, $precio, $stock, $descripcion, $imagenURL, $categoria]);

    $insertId = (int) $pdo->lastInsertId();
    jsonResponse(['id' => $insertId, 'tipo' => $table]);
}

function handlePut(PDO $pdo) {
    $parts = getPathParts();
    if (count($parts) < 2) {
        badRequest('Tipo o id de producto requerido');
    }

    $tipo = normalizeTipo($parts[0]);
    $id = intval($parts[1]);
    if (!$tipo || $id <= 0) {
        badRequest('Tipo o id inválido');
    }

    $data = getJsonBody();
    if (!$data) {
        badRequest('JSON inválido o vacío');
    }

    $nombre = $data['nombre'] ?? null;
    $precio = isset($data['precio']) ? floatval($data['precio']) : null;
    $stock = isset($data['stock']) ? intval($data['stock']) : null;
    $descripcion = $data['descripcion'] ?? null;
    $imagenURL = $data['imagenURL'] ?? null;
    $categoria = $data['categoria'] ?? null;

    $table = $tipo;
    $idCol = getIdColumnForTable($table);

    $sets = [];
    $params = [];

    if ($nombre !== null) {
        $sets[] = '`Nombre` = ?';
        $params[] = $nombre;
    }
    if ($precio !== null) {
        $sets[] = '`Precio` = ?';
        $params[] = $precio;
    }
    if ($stock !== null) {
        $sets[] = '`Stock` = ?';
        $params[] = $stock;
    }
    if ($descripcion !== null) {
        $sets[] = '`Descripcion` = ?';
        $params[] = $descripcion;
    }
    if ($imagenURL !== null) {
        $sets[] = '`ImagenURL` = ?';
        $params[] = $imagenURL;
    }
    if ($categoria !== null) {
        $sets[] = '`Categoria` = ?';
        $params[] = $categoria;
    }

    if (empty($sets)) {
        badRequest('No hay campos para actualizar');
    }

    $params[] = $id;

    $sql = "UPDATE `$table` SET " . implode(', ', $sets) . " WHERE `$idCol` = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    jsonResponse(['message' => 'Producto actualizado']);
}

function handleDelete(PDO $pdo) {
    $parts = getPathParts();
    if (count($parts) < 2) {
        badRequest('Tipo o id de producto requerido');
    }

    $tipo = normalizeTipo($parts[0]);
    $id = intval($parts[1]);

    if (!$tipo || $id <= 0) {
        badRequest('Tipo o id inválido');
    }

    $table = $tipo;
    $idCol = getIdColumnForTable($table);

    $stmt = $pdo->prepare("DELETE FROM `$table` WHERE `$idCol` = ?");
    $stmt->execute([$id]);

    jsonResponse(['message' => 'Producto eliminado']);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    handleGet($pdo);
}

if ($method === 'POST') {
    handlePost($pdo);
}

if ($method === 'PUT') {
    handlePut($pdo);
}

if ($method === 'DELETE') {
    handleDelete($pdo);
}

methodNotAllowed();
