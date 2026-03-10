const path = require('path');

const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors({
  origin: true,               // permite cualquier origen (dev)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'Index.html'));
});

// Configuración de conexión (ajusta si es necesario)
const config = {
  user: 'floreria_node',
  password: 'test1234',
  server: 'CHALDEAP\\SQLEXPRESS',
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
    console.log('Conectado a SQL Server exitosamente 🌸');
    return pool;
  })
  .catch(err => {
    console.error('¡FALLO CRÍTICO! No se pudo conectar a la base de datos:', err);
    process.exit(1);
  });

// Ruta para obtener productos (ajusta la query si tu tabla no es "Productos")
app.get('/api/productos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 'Ramo' AS tipo, Id_ramo AS id, Nombre, Precio, Descripción, Stock, NULL AS ImagenURL
      FROM Ramos
      UNION ALL
      SELECT 'Accesorio' AS tipo, Id_accesorio AS id, Nombre, Precio, Descripción, Stock, NULL AS ImagenURL
      FROM Accesorios
      UNION ALL
      SELECT 'Decorativo' AS tipo, Id_decorativo AS id, Nombre, Precio, Descripción, Stock, NULL AS ImagenURL
      FROM Decorativos
      ORDER BY Nombre
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});