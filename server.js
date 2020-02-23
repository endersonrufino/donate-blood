//configurando servidor
const express = require('express');
const server = express();
const nunjucks = require('nunjucks');

//configurano arquivos estaticos
server.use(express.static('public'));

//habilitar corpo do fomulario
server.use(express.urlencoded({ extended: true }));

//conection database
const Pool = require('pg').Pool;
const db = new Pool({
    user: 'postgres',
    password: 'admin',
    host: 'localhost',
    port: 5432,
    database: 'DonateBlood'
});

//configurando template engine
nunjucks.configure("./", {
    express: server,
    noCache: true,
});

//configurando apresentação da pagina
server.get("/", function(request, response) {

    db.query("SELECT * FROM donors", function(error, result) {

        if (error) {
            return response.send("erro ao fazer a consulta");
        }

        const donors = result.rows;

        return response.render("index.html", { donors });
    });
});

server.post("/", function(request, response) {
    const name = request.body.name;
    const email = request.body.email;
    const blood = request.body.blood;

    if (name == "" || email == "" || blood == "") {
        return response.send("Todos os campos são obrigatórios.");
    }

    const query = `
    INSERT INTO donors ("name", "email", "blood")
    values ($1, $2, $3)`;

    const values = [name, email, blood];

    db.query(query, values, function(error) {
        if (error) {
            return response.send("erro ao inserir os dados");
        }

        return response.redirect("/");
    });
});

//ligando servidor e liberando porta 3000
server.listen(3000);