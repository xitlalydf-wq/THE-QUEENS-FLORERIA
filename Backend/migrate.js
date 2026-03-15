const sql = require('mssql');

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

async function migrate() {
  try {
    let pool = await sql.connect(config);

    // Migration for Ramos table
    // Add Categoria column if not exists
    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Ramos') AND name = 'Categoria') 
      ALTER TABLE Ramos ADD Categoria VARCHAR(50);`);

    // Add ImagenURL column if not exists
    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Ramos') AND name = 'ImagenURL') 
      ALTER TABLE Ramos ADD ImagenURL VARCHAR(255);`);

    // Assuming there are records with Id_ramo 1 to 6, assign categories
    await pool.request().query(`UPDATE Ramos SET Categoria = 'clasicos' WHERE Id_ramo IN (1,2);`);
    await pool.request().query(`UPDATE Ramos SET Categoria = 'premium' WHERE Id_ramo IN (3,4);`);
    await pool.request().query(`UPDATE Ramos SET Categoria = 'especiales' WHERE Id_ramo IN (5,6);`);

    // Update ImagenURL with absolute paths
    await pool.request().query(`UPDATE Ramos SET ImagenURL = '/images/ramo' + CAST(Id_ramo AS VARCHAR) + '.jpg' WHERE ImagenURL IS NULL;`);

    // Migration for Accesorios table
    // Add Categoria column if not exists
    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Accesorios') AND name = 'Categoria') 
      ALTER TABLE Accesorios ADD Categoria VARCHAR(50);`);

    // Add ImagenURL column if not exists
    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Accesorios') AND name = 'ImagenURL') 
      ALTER TABLE Accesorios ADD ImagenURL VARCHAR(255);`);

    // Assuming there are records with Id_accesorio 1 to 6, assign categories (adjust as needed)
    await pool.request().query(`UPDATE Accesorios SET Categoria = 'vases' WHERE Id_accesorio IN (1,2);`);
    await pool.request().query(`UPDATE Accesorios SET Categoria = 'extras' WHERE Id_accesorio IN (3,4);`);
    await pool.request().query(`UPDATE Accesorios SET Categoria = 'regalos' WHERE Id_accesorio IN (5,6);`);

    // Update ImagenURL with absolute paths
    await pool.request().query(`UPDATE Accesorios SET ImagenURL = '/images/accesorio' + CAST(Id_accesorio AS VARCHAR) + '.jpg' WHERE ImagenURL IS NULL;`);

    // Migration for Decorativos table
    // Add Categoria column if not exists
    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Decorativos') AND name = 'Categoria') 
      ALTER TABLE Decorativos ADD Categoria VARCHAR(50);`);

    // Add ImagenURL column if not exists
    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Decorativos') AND name = 'ImagenURL') 
      ALTER TABLE Decorativos ADD ImagenURL VARCHAR(255);`);

    // Assuming there are records with Id_decorativo 1 to 6, assign categories (adjust as needed)
    await pool.request().query(`UPDATE Decorativos SET Categoria = 'centros' WHERE Id_decorativo IN (1,2);`);
    await pool.request().query(`UPDATE Decorativos SET Categoria = 'eventos' WHERE Id_decorativo IN (3,4);`);
    await pool.request().query(`UPDATE Decorativos SET Categoria = 'especial' WHERE Id_decorativo IN (5,6);`);

    // Update ImagenURL with absolute paths
    await pool.request().query(`UPDATE Decorativos SET ImagenURL = '/images/decorativo' + CAST(Id_decorativo AS VARCHAR) + '.jpg' WHERE ImagenURL IS NULL;`);

    // Add Telefono column to Clientes table if not exists
    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Clientes') AND name = 'Telefono') 
      ALTER TABLE Clientes ADD Telefono VARCHAR(20);`);

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();