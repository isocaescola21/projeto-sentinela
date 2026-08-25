const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =====================================================
// BANCO
// =====================================================

const DB_FILE = path.join(__dirname, "db.json");

function criarBanco() {

    return {
        usuarios: [
            {
                usuario: "admin",
                senha: "123",
                tipo: "medico"
            },
            {
                usuario: "triagem",
                senha: "123",
                tipo: "triagem"
            },
            {
                usuario: "atendimento",
                senha: "123",
                tipo: "atendimento"
            }
        ],

        pacientes: [],
        triagens: [],
        consultas: []
    };

}


function lerBanco() {

    try {

        if (!fs.existsSync(DB_FILE)) {

            const banco = criarBanco();

            salvarBanco(banco);

            return banco;
        }

        const arquivo =
            fs.readFileSync(DB_FILE, "utf8");

        if (!arquivo.trim()) {

            const banco = criarBanco();

            salvarBanco(banco);

            return banco;
        }

        const banco =
            JSON.parse(arquivo);

        if (!Array.isArray(banco.usuarios))
            banco.usuarios = [];

        if (!Array.isArray(banco.pacientes))
            banco.pacientes = [];

        if (!Array.isArray(banco.triagens))
            banco.triagens = [];

        if (!Array.isArray(banco.consultas))
            banco.consultas = [];

        return banco;

    } catch (erro) {

        console.error(
            "Erro ao ler banco:",
            erro
        );

        return criarBanco();
    }

}


function salvarBanco(banco) {

    try {

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(
                banco,
                null,
                2
            ),
            "utf8"
        );

        return true;

    } catch (erro) {

        console.error(
            "Erro ao salvar banco:",
            erro
        );

        return false;
    }

}


// =====================================================
// TESTE
// =====================================================

app.get("/teste", (req, res) => {

    res.json({

        sucesso: true,

        mensagem:
            "Servidor funcionando corretamente."

    });

});


// =====================================================
// LOGIN
// =====================================================

app.post("/login", (req, res) => {

    try {

        const banco = lerBanco();

        const usuario =
            banco.usuarios.find(

                u =>
                    u.usuario === req.body.usuario &&
                    u.senha === req.body.senha

            );

        if (!usuario) {

            return res.status(401).json({

                sucesso: false,

                erro:
                    "Usuário ou senha inválidos."

            });

        }

        res.json({

            sucesso: true,

            usuario: usuario.usuario,

            tipo: usuario.tipo

        });

    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );

        res.status(500).json({

            sucesso: false,

            erro:
                "Erro interno no login."

        });

    }

});


// =====================================================
// ATENDIMENTO
// =====================================================

app.post("/atendimento", (req, res) => {

    try {

        const banco = lerBanco();

        const nome =
            String(req.body.nome || "").trim();

        const cpf =
            String(req.body.cpf || "").trim();

        const tipo =
            String(req.body.tipo || "").trim();


        if (!nome || !cpf || !tipo) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Nome, CPF e tipo são obrigatórios."

            });

        }


        const paciente = {

            id: Date.now(),

            nome: nome,

            cpf: cpf,

            tipo: tipo,

            status:
                "aguardando_triagem",

            sintomas: "",

            temperatura: null,

            alergia: "",

            observacao: "",

            risco: "",

            diagnostico: "",

            observacaoMedica: "",

            conduta: ""

        };


        banco.pacientes.push(
            paciente
        );


        if (!salvarBanco(banco)) {

            return res.status(500).json({

                sucesso: false,

                erro:
                    "Erro ao salvar paciente."

            });

        }


        res.status(201).json({

            sucesso: true,

            mensagem:
                "Paciente cadastrado com sucesso.",

            paciente: paciente

        });

    } catch (erro) {

        console.error(
            "Erro no atendimento:",
            erro
        );

        res.status(500).json({

            sucesso: false,

            erro:
                "Erro interno no atendimento."

        });

    }

});


// =====================================================
// PACIENTES DA TRIAGEM
// =====================================================

app.get("/pacientes-triagem", (req, res) => {

    try {

        const banco = lerBanco();

        const pacientes =
            banco.pacientes.filter(

                paciente =>
                    paciente.status ===
                    "aguardando_triagem"

            );


        res.json(pacientes);

    } catch (erro) {

        console.error(
            "Erro ao buscar pacientes:",
            erro
        );

        res.status(500).json({

            sucesso: false,

            erro:
                "Erro ao buscar pacientes."

        });

    }

});


// =====================================================
// SALVAR TRIAGEM
// =====================================================

app.post("/triagem", (req, res) => {

    try {

        console.log("");
        console.log(
            "========== TRIAGEM =========="
        );

        console.log(
            "Dados recebidos:",
            req.body
        );


        const banco = lerBanco();


        const id = req.body.id;

        const sintomas =
            String(
                req.body.sintomas || ""
            ).trim();

        const temperatura =
            Number(
                req.body.temperatura
            );

        const alergia =
            String(
                req.body.alergia || ""
            ).trim();

        const observacao =
            String(
                req.body.observacao || ""
            ).trim();

        const risco =
            String(
                req.body.risco || ""
            ).trim();


        // ================================================
        // VALIDAÇÕES
        // ================================================

        if (
            id === undefined ||
            id === null ||
            String(id).trim() === ""
        ) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Paciente não informado."

            });

        }


        if (!sintomas) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Sintoma não informado."

            });

        }


        if (
            Number.isNaN(temperatura)
        ) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Temperatura inválida."

            });

        }


        // ================================================
        // BUSCAR PACIENTE
        // ================================================

        const paciente =
            banco.pacientes.find(

                p =>
                    String(p.id) ===
                    String(id)

            );


        if (!paciente) {

            return res.status(404).json({

                sucesso: false,

                erro:
                    "Paciente não encontrado."

            });

        }


        // ================================================
        // ATUALIZAR PACIENTE
        // ================================================

        paciente.sintomas =
            sintomas;

        paciente.temperatura =
            temperatura;

        paciente.alergia =
            alergia;

        paciente.observacao =
            observacao;

        paciente.risco =
            risco;

        paciente.status =
            "aguardando_medico";


        // ================================================
        // HISTÓRICO DA TRIAGEM
        // ================================================

        const triagem = {

            id: Date.now(),

            pacienteId:
                paciente.id,

            pacienteNome:
                paciente.nome,

            cpf:
                paciente.cpf,

            sintomas:
                paciente.sintomas,

            temperatura:
                paciente.temperatura,

            alergia:
                paciente.alergia,

            observacao:
                paciente.observacao,

            risco:
                paciente.risco,

            data:
                new Date().toISOString()

        };


        banco.triagens.push(
            triagem
        );


        // ================================================
        // SALVAR
        // ================================================

        if (!salvarBanco(banco)) {

            return res.status(500).json({

                sucesso: false,

                erro:
                    "Erro ao salvar a triagem."

            });

        }


        console.log(
            "Triagem salva com sucesso."
        );

        console.log(
            "Paciente:",
            paciente.nome
        );

        console.log(
            "Status:",
            paciente.status
        );


        res.json({

            sucesso: true,

            mensagem:
                "Triagem salva com sucesso.",

            paciente:
                paciente,

            triagem:
                triagem

        });

    } catch (erro) {

        console.error(
            "ERRO NA TRIAGEM:",
            erro
        );

        res.status(500).json({

            sucesso: false,

            erro:
                "Erro interno no servidor.",

            detalhe:
                erro.message

        });

    }

});


// =====================================================
// PACIENTES DO MÉDICO
// =====================================================

app.get("/pacientes-medico", (req, res) => {

    try {

        const banco = lerBanco();

        const pacientes =
            banco.pacientes.filter(

                paciente =>
                    paciente.status ===
                    "aguardando_medico"

            );

        res.json(pacientes);

    } catch (erro) {

        console.error(
            "Erro ao buscar pacientes médicos:",
            erro
        );

        res.status(500).json({

            sucesso: false,

            erro:
                "Erro ao buscar pacientes."

        });

    }

});


// =====================================================
// BUSCAR PACIENTE
// =====================================================

app.get("/paciente/:id", (req, res) => {

    const banco = lerBanco();

    const paciente =
        banco.pacientes.find(

            p =>
                String(p.id) ===
                String(req.params.id)

        );


    if (!paciente) {

        return res.status(404).json({

            sucesso: false,

            erro:
                "Paciente não encontrado."

        });

    }


    res.json(paciente);

});


// =====================================================
// CONSULTA MÉDICA
// =====================================================

app.post("/consulta", (req, res) => {

    try {

        const banco = lerBanco();

        const id = req.body.id;

        const diagnostico =
            String(
                req.body.diagnostico || ""
            ).trim();

        const observacaoMedica =
            String(
                req.body.observacaoMedica || ""
            ).trim();

        const conduta =
            String(
                req.body.conduta || ""
            ).trim();


        const paciente =
            banco.pacientes.find(

                p =>
                    String(p.id) ===
                    String(id)

            );


        if (!paciente) {

            return res.status(404).json({

                sucesso: false,

                erro:
                    "Paciente não encontrado."

            });

        }


        paciente.diagnostico =
            diagnostico;

        paciente.observacaoMedica =
            observacaoMedica;

        paciente.conduta =
            conduta;

        paciente.status =
            "atendido";


        const consulta = {

            id: Date.now(),

            pacienteId:
                paciente.id,

            pacienteNome:
                paciente.nome,

            diagnostico:
                diagnostico,

            observacao:
                observacaoMedica,

            conduta:
                conduta,

            data:
                new Date().toISOString()

        };


        banco.consultas.push(
            consulta
        );


        if (!salvarBanco(banco)) {

            return res.status(500).json({

                sucesso: false,

                erro:
                    "Erro ao salvar consulta."

            });

        }


        res.json({

            sucesso: true,

            mensagem:
                "Consulta salva com sucesso.",

            paciente:
                paciente,

            consulta:
                consulta

        });

    } catch (erro) {

        console.error(
            "Erro na consulta:",
            erro
        );

        res.status(500).json({

            sucesso: false,

            erro:
                "Erro interno ao salvar consulta."

        });

    }

});


// =====================================================
// FRONTEND
// =====================================================
// COLOQUE DEPOIS DE TODAS AS ROTAS DA API

const FRONTEND_PATH =
    path.join(__dirname, "../frontend");

app.use(
    express.static(FRONTEND_PATH)
);


// =====================================================
// ROTA NÃO ENCONTRADA
// =====================================================

app.use((req, res) => {

    if (
        req.originalUrl.startsWith("/api") ||
        req.originalUrl === "/triagem" ||
        req.originalUrl === "/pacientes-triagem" ||
        req.originalUrl === "/pacientes-medico"
    ) {

        return res.status(404).json({

            sucesso: false,

            erro:
                "Rota da API não encontrada."

        });

    }


    res.status(404).send(
        "Página não encontrada."
    );

});


// =====================================================
// SERVIDOR
// =====================================================

app.listen(PORT, () => {

    console.log("--------------------------------");
    console.log("🏥 Hospital Pro");
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("--------------------------------");

});
