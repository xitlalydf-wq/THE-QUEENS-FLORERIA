const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a SQL Server
const config = {
    user: 'tu_usuario',
    password: 'tu_contraseña',
    server: 'localhost', // o tu servidor SQL
    database: 'tu_base_de_datos',
    options: {
        encrypt: true, // para conexiones seguras
        trustServerCertificate: true // para desarrollo
    }
};

// Conectar a la base de datos
sql.connect(config).then(pool => {
    console.log('Conectado a SQL Server');
    
    // Endpoint para obtener datos
    app.get('/api/datos', async (req, res) => {
        try {
            const result = await pool.request().query('SELECT * FROM tu_tabla');
            res.json(result.recordset);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });
    
}).catch(err => console.error('Error de conexión:', err));

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));