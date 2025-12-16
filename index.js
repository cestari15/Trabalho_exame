import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const host = "0.0.0.0";
const porta = 3000;
const server = express();

// =======================
// DADOS EM MEMÓRIA
// =======================
let interessados = [];
let pets = [];
let adocoes = [];

// =======================
// CONFIG
// =======================
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

server.use(session({
    secret: "segredoPetShop",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

// =======================
// LOGIN
// =======================
function auth(req, res, next) {
    if (req.session.login) next();
    else res.redirect("/login");
}

// =======================
// TEMPLATE BOOTSTRAP
// =======================
function layout(titulo, corpo, menu = true) {
    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>${titulo}</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
</head>
<body class="bg-body-tertiary">

${menu ? `
<nav class="navbar navbar-dark bg-primary shadow">
    <div class="container">
        <span class="navbar-brand fw-bold"> PET SHOP</span>
        <a href="/logout" class="btn btn-outline-light btn-sm">
            <i class="bi bi-box-arrow-right"></i> Logout
        </a>
    </div>
</nav>
` : ``}

<div class="container my-4">
    <div class="card shadow-lg border-0">
        <div class="card-header bg-primary text-white fw-bold">
            ${titulo}
        </div>
        <div class="card-body">
            ${corpo}
        </div>
    </div>
</div>

<footer class="text-center text-muted small py-3">
    Sistema Pet Shop • Programação para Internet
</footer>

</body>
</html>`;
}

// =======================
// LOGIN
// =======================
server.get("/login", (req, res) => {
    res.send(layout("Login do Sistema", `
        <form method="POST" class="col-md-5 mx-auto">
            <div class="form-floating mb-3">
                <input class="form-control" name="usuario" placeholder="Usuário">
                <label>Usuário</label>
            </div>
            <div class="form-floating mb-3">
                <input type="password" class="form-control" name="senha" placeholder="Senha">
                <label>Senha</label>
            </div>
            <button class="btn btn-primary w-100">
                <i class="bi bi-box-arrow-in-right"></i> Entrar
            </button>
        </form>
    `, false));
});

server.post("/login", (req, res) => {
    if (req.body.usuario === "admin" && req.body.senha === "admin") {
        req.session.login = true;
        return res.redirect("/");
    }
    res.send(layout("Erro", `
        <div class="alert alert-danger text-center">
            <i class="bi bi-exclamation-triangle"></i> Login inválido
        </div>
        <a href="/login" class="btn btn-secondary w-100">Voltar</a>
    `, false));
});

server.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// =======================
// MENU
// =======================
server.get("/", auth, (req, res) => {
    const ultimo = req.cookies.ultimo || "Primeiro acesso";
    server.use((req,res,next)=>next());
    res.cookie("ultimo", new Date().toLocaleString());

    res.send(layout("Menu Principal", `
        <p class="text-muted">Último acesso: <strong>${ultimo}</strong></p>

        <div class="row g-3">
            <div class="col-md-4">
                <div class="card border-primary h-100 shadow-sm">
                    <div class="card-body text-center">
                        <i class="bi bi-people fs-1 text-primary"></i>
                        <h5 class="mt-2">Interessados</h5>
                        <a href="/interessado" class="btn btn-outline-primary w-100">Cadastrar</a>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card border-success h-100 shadow-sm">
                    <div class="card-body text-center">
                        <i class="bi bi-heart-pulse fs-1 text-success"></i>
                        <h5 class="mt-2">Pets</h5>
                        <a href="/pet" class="btn btn-outline-success w-100">Cadastrar</a>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card border-warning h-100 shadow-sm">
                    <div class="card-body text-center">
                        <i class="bi bi-house-heart fs-1 text-warning"></i>
                        <h5 class="mt-2">Adoção</h5>
                        <a href="/adocao" class="btn btn-outline-warning w-100">Registrar</a>
                    </div>
                </div>
            </div>
        </div>
    `));
});

// =======================
// INTERESSADOS
// =======================
server.get("/interessado", auth, (req, res) => {
    res.send(layout("Cadastro de Interessado", `
        <form method="POST">
            <div class="row g-2">
                <div class="col-md-4"><input class="form-control" name="nome" placeholder="Nome"></div>
                <div class="col-md-4"><input class="form-control" name="email" placeholder="Email"></div>
                <div class="col-md-4"><input class="form-control" name="telefone" placeholder="Telefone"></div>
            </div>
            <button class="btn btn-primary mt-3">Salvar</button>
        </form>
    `));
});

server.post("/interessado", auth, (req, res) => {
    if (req.body.nome && req.body.email && req.body.telefone) {
        interessados.push(req.body);
    }
    res.redirect("/listaInteressados");
});

server.get("/listaInteressados", auth, (req, res) => {
    const linhas = interessados.map(i => `
        <tr>
            <td>${i.nome}</td>
            <td>${i.email}</td>
            <td>${i.telefone}</td>
        </tr>`).join("");

    res.send(layout("Interessados Cadastrados", `
        <table class="table table-hover table-bordered">
            <thead class="table-primary">
                <tr><th>Nome</th><th>Email</th><th>Telefone</th></tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>
    `));
});

// =======================
// PETS
// =======================
server.get("/pet", auth, (req, res) => {
    res.send(layout("Cadastro de Pet", `
        <form method="POST">
            <div class="row g-2">
                <div class="col-md-4"><input class="form-control" name="nome" placeholder="Nome"></div>
                <div class="col-md-4"><input class="form-control" name="raca" placeholder="Raça"></div>
                <div class="col-md-4"><input type="number" class="form-control" name="idade" placeholder="Idade"></div>
            </div>
            <button class="btn btn-success mt-3">Salvar</button>
        </form>
    `));
});

server.post("/pet", auth, (req, res) => {
    if (req.body.nome && req.body.raca && req.body.idade) {
        pets.push(req.body);
    }
    res.redirect("/listaPets");
});

server.get("/listaPets", auth, (req, res) => {
    const linhas = pets.map(p => `
        <tr>
            <td>${p.nome}</td>
            <td>${p.raca}</td>
            <td>${p.idade}</td>
        </tr>`).join("");

    res.send(layout("Pets Cadastrados", `
        <table class="table table-hover table-bordered">
            <thead class="table-success">
                <tr><th>Nome</th><th>Raça</th><th>Idade</th></tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>
    `));
});

// =======================
// ADOÇÃO
// =======================
server.get("/adocao", auth, (req, res) => {
    const iOpt = interessados.map(i => `<option>${i.nome}</option>`).join("");
    const pOpt = pets.map(p => `<option>${p.nome}</option>`).join("");

    res.send(layout("Desejo de Adoção", `
        <form method="POST">
            <select class="form-select mb-2" name="interessado">
                <option value="">Interessado</option>${iOpt}
            </select>
            <select class="form-select mb-2" name="pet">
                <option value="">Pet</option>${pOpt}
            </select>
            <button class="btn btn-warning w-100">Registrar</button>
        </form>
    `));
});

server.post("/adocao", auth, (req, res) => {
    if (req.body.interessado && req.body.pet) {
        adocoes.push({
            interessado: req.body.interessado,
            pet: req.body.pet,
            data: new Date().toLocaleString()
        });
    }
    res.redirect("/listaAdocoes");
});

server.get("/listaAdocoes", auth, (req, res) => {
    const linhas = adocoes.map(a => `
        <tr>
            <td>${a.interessado}</td>
            <td>${a.pet}</td>
            <td>${a.data}</td>
        </tr>`).join("");

    res.send(layout("Adoções Registradas", `
        <table class="table table-hover table-bordered">
            <thead class="table-warning">
                <tr><th>Interessado</th><th>Pet</th><th>Data</th></tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>
    `));
});

// =======================
// SERVIDOR
// =======================
server.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});



//https://github.com/cestari15/Trabalho_exame.git github
//trabalho-exame.vercel.app  vercel