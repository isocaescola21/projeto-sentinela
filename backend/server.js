const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

// ===============================
// CONFIGURAÇÕES
// ===============================

app.use(express.json());
app.use(cors());

// Servir o frontend
app.use(express.static(path.join(__dirname, "../frontend")));

const DB_FILE = path.join(__dirname, "db.json");

// ===============================
// BANCO DE DADOS
// ===============================

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const bancoInicial = {
      usuarios: [],
      pacientes: [],
      triagens: [],
      consultas: []
    };

    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(bancoInicial, null, 2)
    );

    return bancoInicial;
  }

  try {
    const dados = fs.readFileSync(DB_FILE, "utf8");

    return JSON.parse(dados);
  } catch (erro) {
    console.error("Erro ao ler db.json:", erro);

    return {
      usuarios: [],
      pacientes: [],
      triagens: [],
      consultas: []
    };
  }
}

function writeDB(data) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(data, null, 2)
  );
}

// ===============================
// LOGIN
// ===============================

app.post("/login", (req, res) => {
  const db = readDB();

  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({
      erro: "Usuário e senha são obrigatórios"
    });
  }

  const user = db.usuarios.find(
    u =>
      u.usuario === usuario &&
      u.senha === senha
  );

  if (!user) {
    return res.status(401).json({
      erro: "Usuário ou senha inválidos"
    });
  }

  res.json({
    sucesso: true,
    usuario: user.usuario,
    tipo: user.tipo
  });
});

// ===============================
// ATENDIMENTO
// ===============================

app.post("/atendimento", (req, res) => {
  const db = readDB();

  const paciente = {
    id: Date.now(),
    nome: req.body.nome,
    cpf: req.body.cpf,
    tipo: req.body.tipo,
    status: "triagem",
    createdAt: new Date()
  };

  db.pacientes.push(paciente);

  writeDB(db);

  res.json({
    sucesso: true,
    paciente
  });
});

// ===============================
// TRIAGEM
// ===============================

app.post("/triagem", (req, res) => {
  const db = readDB();

  let risco = req.body.risco;

  const temperatura = Number(req.body.temperatura);

  if (temperatura >= 39) {
    risco = "vermelho";
  } else if (temperatura >= 38) {
    risco = "amarelo";
  } else if (!risco) {
    risco = "verde";
  }

  const triagem = {
    id: Date.now(),
    nome: req.body.nome,
    sintoma: req.body.sintoma,
    temperatura: temperatura,
    alergia: req.body.alergia,
    observacao: req.body.observacao,
    risco: risco,
    status: "aguardando_medico",
    createdAt: new Date()
  };

  db.triagens.push(triagem);

  writeDB(db);

  res.json({
    sucesso: true,
    triagem
  });
});

// ===============================
// LISTAR TRIAGENS
// ===============================

app.get("/triagens", (req, res) => {
  const db = readDB();

  res.json(db.triagens);
});

// ===============================
// LISTA DE MEDICAÇÕES
// ===============================

app.get("/lista-medicacoes", (req, res) => {
  res.json([
    "Dipirona",
    "Paracetamol",
    "Ibuprofeno",
    "Amoxicilina",
    "Azitromicina",
    "Loratadina",
    "Omeprazol",
    "Buscopan",
    "Dramin",
    "Soro fisiológico"
  ]);
});

// ===============================
// CONSULTA MÉDICA
// ===============================

app.post("/consulta", (req, res) => {
  const db = readDB();

  const consulta = {
    id: Date.now(),
    paciente: req.body.paciente,
    diagnostico: req.body.diagnostico,
    medicacao: req.body.medicacao,
    obs: req.body.obs,
    createdAt: new Date()
  };

  db.consultas.push(consulta);

  writeDB(db);

  res.json({
    sucesso: true,
    consulta
  });
});

// ===============================
// LISTAR CONSULTAS
// ===============================

app.get("/medicacoes", (req, res) => {
  const db = readDB();

  res.json(db.consultas);
});

// ===============================
// ROTA PRINCIPAL
// ===============================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/index.html")
  );
});

// ===============================
// SERVIDOR
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
