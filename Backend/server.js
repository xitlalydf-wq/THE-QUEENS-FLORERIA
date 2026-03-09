const express = require("express");
const cors = require("cors");
const sql = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/productos", async (req, res) => {

    try {

        const result = await sql.query("SELECT * FROM Productos");
        res.json(result.recordset);

    } catch (err) {

        res.send(err);

    }

});

app.listen(3000, () => {
    console.log("Servidor en puerto 3000");
});