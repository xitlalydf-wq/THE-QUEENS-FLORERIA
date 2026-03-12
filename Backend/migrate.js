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
    await pool.request().query(`UPDATE Ramos SET ImagenURL = '/images/ramo' + CAST(Id_ramo AS VARCHAR) + '.jpg' WHERE ImagenURL IS NOT NULL OR ImagenURL IS NULL;`);

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();