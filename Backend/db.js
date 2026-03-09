const sql = require("mssql");

const config = {
    user: "sa",
    password: "tu_password",
    server: "localhost",
    database: "FloreriaDB",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

sql.connect(config)
.then(() => console.log("Conectado a SQL Server"))
.catch(err => console.log("Error:", err));

module.exports = sql;

