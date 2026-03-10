const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,          // 'CHALDEAP\SQLEXPRESS'
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,                        // Obligatorio en tu config
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true'  // true para local
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

console.log('Conectando a BD:', process.env.DB_DATABASE);

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('¡Conexión exitosa a SQL Server con usuario SQL! 🌸');
    return pool;
  })
  .catch(err => {
    console.error('Error al conectar:', err.message);
    console.error('Detalles:', err);
  });

module.exports = { sql, poolPromise };