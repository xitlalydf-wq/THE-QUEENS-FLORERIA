const path = require('path');

const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');

const blacklistTokens = new Set();

const app = express();

app.use(cors({
  origin: true,               // permite cualquier origen (dev)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..')));

// Servir carpetas específicas para navegación
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.use('/Productos', express.static(path.join(__dirname, '..', 'Productos')));
app.use('/Compras', express.static(path.join(__dirname, '..', 'Compras')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'images')); // Guardar en la carpeta images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'Index.html'));
});

// Configuración de conexión (ajusta si es necesario)
const config = {
  user: 'floreria_node',
  password: 'test1234',
  server: 'XITLALY\\SQLEXPRESS',
  database: 'DB_THE_QUEENS_FLORERIA',
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server exitosamente ');
    return pool;
  })
  .catch(err => {
    console.error('¡FALLO CRÍTICO! No se pudo conectar a la base de datos:', err);
    process.exit(1);
  });

// Logging middleware para comprobar que las peticiones a /api/productos llegan
app.use('/api/productos', (req, res, next) => {
  console.log('[API] request to /api/productos', req.method, req.url);
  next();
});

// Ruta para obtener productos (ajusta la query si tu tabla no es "Productos")
app.get('/api/productos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 'ramos' AS tipo, Id_ramo AS id, Nombre, Precio, Descripción, Stock, ISNULL(ImagenURL, '') AS ImagenURL, ISNULL(Categoria, 'Ramos') AS Categoria
      FROM Ramos
      UNION ALL
      SELECT 'accesorios' AS tipo, Id_accesorio AS id, Nombre, Precio, Descripción, Stock, ISNULL(ImagenURL, '') AS ImagenURL, ISNULL(Categoria, 'Accesorios') AS Categoria
      FROM Accesorios
      UNION ALL
      SELECT 'decorativos' AS tipo, Id_decorativo AS id, Nombre, Precio, Descripción, Stock, ISNULL(ImagenURL, '') AS ImagenURL, ISNULL(Categoria, 'Decorativos') AS Categoria
      FROM Decorativos
      ORDER BY Nombre
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Ruta para obtener clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT c.Id_cliente, c.Nombre, c.Correo, c.Telefono,
             COUNT(p.Id_pedido) AS Pedidos,
             ISNULL(SUM(p.Total), 0) AS TotalComprado,
             MAX(p.Fecha) AS UltimaCompra
      FROM Clientes c
      LEFT JOIN Pedidos p ON c.Id_cliente = p.Id_cliente
      GROUP BY c.Id_cliente, c.Nombre, c.Correo, c.Telefono
    `;

    const filter = req.query.filter;
    if (filter) {
      if (filter === 'frecuentes') {
        query += ` HAVING COUNT(p.Id_pedido) > 5`;
      } else if (filter === 'nuevos') {
        query += ` HAVING c.Id_cliente IN (SELECT Id_cliente FROM Clientes WHERE DATEDIFF(MONTH, GETDATE(), FechaRegistro) <= 1)`;
        // Assuming FechaRegistro exists, if not, we might need to add it or use another logic
      } else if (filter === 'recientes') {
        query += ` HAVING MAX(p.Fecha) >= DATEADD(MONTH, -1, GETDATE())`;
      }
    }

    query += ` ORDER BY c.Nombre`;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Ruta para obtener pedidos
app.get('/api/pedidos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.Id_pedido, p.Id_cliente, c.Nombre AS Cliente, p.Fecha, p.Estado, p.Total, p.Notas
      FROM Pedidos p
      JOIN Clientes c ON p.Id_cliente = c.Id_cliente
      ORDER BY p.Fecha DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// CRUD para productos
// Obtener producto individual
app.get('/api/productos/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    const pool = await poolPromise;
    let table, idColumn;
    const tipoNorm = tipo.toLowerCase();

    switch (tipoNorm) {
      case 'ramo':
      case 'ramos':
        table = 'Ramos';
        idColumn = 'ID_Ramo';
        break;
      case 'accesorio':
      case 'accesorios':
        table = 'Accesorios';
        idColumn = 'ID_Accesorio';
        break;
      case 'decorativo':
      case 'decorativos':
        table = 'Decorativos';
        idColumn = 'ID_Decorativo';
        break;
      default:
        return res.status(400).json({ error: 'Tipo de producto inválido' });
    }

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM ${table} WHERE ${idColumn} = @id`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = result.recordset[0];
    res.json({
      id: producto[idColumn],
      tipo,
      nombre: producto.Nombre,
      descripcion: producto.Descripcion,
      precio: producto.Precio,
      stock: producto.Stock,
      imagen: producto.ImagenURL,
      categoria: producto.Categoria
    });
  } catch (err) {
    console.error('Error al obtener producto:', err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Crear producto
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
  try {
    const { tipo, nombre, precio, stock, descripcion, imagenURL, categoria } = req.body;
    const pool = await poolPromise;
    let table, idColumn;

    // Determinar imagenURL: usar archivo subido si existe, sino usar URL proporcionada
    let finalImagenURL = imagenURL;
    if (req.file) {
      finalImagenURL = `/images/${req.file.filename}`;
    }

    if (tipo === 'Ramo') {
      table = 'Ramos';
      idColumn = 'Id_ramo';
    } else if (tipo === 'Accesorio') {
      table = 'Accesorios';
      idColumn = 'Id_accesorio';
    } else if (tipo === 'Decorativo') {
      table = 'Decorativos';
      idColumn = 'Id_decorativo';
    } else {
      return res.status(400).json({ error: 'Tipo de producto inválido' });
    }

    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('precio', sql.Decimal(10,2), precio)
      .input('stock', sql.Int, stock)
      .input('descripcion', sql.Text, descripcion)
      .input('imagenURL', sql.VarChar, finalImagenURL)
      .input('categoria', sql.VarChar, categoria)
      .query(`INSERT INTO ${table} (Nombre, Precio, Stock, Descripción, ImagenURL, Categoria) OUTPUT INSERTED.${idColumn} AS id VALUES (@nombre, @precio, @stock, @descripcion, @imagenURL, @categoria)`);

    res.json({ id: result.recordset[0].id, tipo });
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Actualizar producto
app.put('/api/productos/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    const { nombre, precio, stock, descripcion, imagenURL, categoria } = req.body;
    const pool = await poolPromise;
    let table, idColumn;
    const tipoNorm = tipo.toLowerCase();

    if (tipoNorm === 'ramo' || tipoNorm === 'ramos') {
      table = 'Ramos';
      idColumn = 'Id_ramo';
    } else if (tipoNorm === 'accesorio' || tipoNorm === 'accesorios') {
      table = 'Accesorios';
      idColumn = 'Id_accesorio';
    } else if (tipoNorm === 'decorativo' || tipoNorm === 'decorativos') {
      table = 'Decorativos';
      idColumn = 'Id_decorativo';
    } else {
      return res.status(400).json({ error: 'Tipo de producto inválido' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar, nombre)
      .input('precio', sql.Decimal(10,2), precio)
      .input('stock', sql.Int, stock)
      .input('descripcion', sql.Text, descripcion)
      .input('imagenURL', sql.VarChar, imagenURL)
      .input('categoria', sql.VarChar, categoria)
      .query(`UPDATE ${table} SET Nombre = @nombre, Precio = @precio, Stock = @stock, Descripción = @descripcion, ImagenURL = @imagenURL, Categoria = @categoria WHERE ${idColumn} = @id`);

    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto
app.delete('/api/productos/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    const pool = await poolPromise;
    let table, idColumn;
    const tipoNorm = tipo.toLowerCase();

    if (tipoNorm === 'ramo' || tipoNorm === 'ramos') {
      table = 'Ramos';
      idColumn = 'Id_ramo';
    } else if (tipoNorm === 'accesorio' || tipoNorm === 'accesorios') {
      table = 'Accesorios';
      idColumn = 'Id_accesorio';
    } else if (tipoNorm === 'decorativo' || tipoNorm === 'decorativos') {
      table = 'Decorativos';
      idColumn = 'Id_decorativo';
    } else {
      return res.status(400).json({ error: 'Tipo de producto inválido' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM ${table} WHERE ${idColumn} = @id`);

    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Ruta para obtener administradores
app.get('/api/administradores', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT Id_admin, Nombre, Correo FROM Administradores');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener administradores:', err);
    res.status(500).json({ error: 'Error al obtener administradores' });
  }
});

// Ruta de login
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    const pool = await poolPromise;

    // Buscar en Clientes
    let result = await pool.request()
      .input('correo', sql.NVarChar(255), correo)
      .query(`
        SELECT Id_cliente AS id, Nombre, Contraseña, 'cliente' AS role 
        FROM Clientes 
        WHERE Correo = @correo
      `);

    let user = result.recordset[0];

    // Si no es cliente, buscar en Administradores
    if (!user) {
      result = await pool.request()
        .input('correo', sql.NVarChar(255), correo)
        .query(`
          SELECT Id_admin AS id, Nombre, Contraseña, 'admin' AS role 
          FROM Administradores 
          WHERE Correo = @correo
        `);
      user = result.recordset[0];
    }

    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const match = await bcrypt.compare(contrasena, user.Contraseña.trim());
    if (match) {
  console.log(`Login exitoso: ${correo} (${user.role})`);
}
    if (!match) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    res.json({
      success: true,
      token: 'token-simulado-' + Date.now(),
      role: user.role,
      nombre: user.Nombre,
      id: user.id
    });
  } catch (err) {
    console.error('Error en /api/login:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de registro
app.post('/api/signup', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
  }

  try {
    const pool = await poolPromise;

    // Verificar si el correo ya existe en Clientes
    let result = await pool.request()
      .input('correo', sql.NVarChar(255), correo)
      .query('SELECT Id_cliente FROM Clientes WHERE Correo = @correo');

    if (result.recordset.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Verificar en Administradores (por si acaso)
    result = await pool.request()
      .input('correo', sql.NVarChar(255), correo)
      .query('SELECT Id_admin FROM Administradores WHERE Correo = @correo');

    if (result.recordset.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar nuevo cliente
    await pool.request()
      .input('nombre', sql.NVarChar(255), nombre)
      .input('correo', sql.NVarChar(255), correo)
      .input('contrasena', sql.NVarChar(256), hashedPassword)
      .query('INSERT INTO Clientes (Nombre, Correo, Contraseña) VALUES (@nombre, @correo, @contrasena)');

    console.log(`Usuario registrado: ${correo}`);
    res.json({ success: true, message: 'Cuenta creada exitosamente' });
  } catch (err) {
    console.error('Error en /api/signup:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post ('/api/logout', (req, res) => {
  const autoHeader = req.headers['authorization'];
  const token = autoHeader && autoHeader.split(' ')[1];

  if (token) {
    blacklistTokens.add(token);
  }
res.json({message: 'Logout exitoso'})

function verificarToken(req, res, next) {
  const autoHeader = req.headers['authorization'];
  const token = autoHeader && autoHeader.split(' ')[1];

  if (!token || blacklistTokens.has(token)) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  jwt.verify(token, 'secreto', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//<!--Probando 123-->