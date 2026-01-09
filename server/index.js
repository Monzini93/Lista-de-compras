const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// Dados em memória (temporário para teste)
const users = [];
const shoppingLists = [];

// Middleware de autenticação
function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

// Registro
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: "Email e senha obrigatórios" });
    }

    if (users.find(u => u.email === email)) {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(password, 10);
    const userId = Math.random().toString(36).substr(2, 9);

    users.push({ id: userId, email, password: senhaHash });

    return res.status(201).json({ ok: true, userId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao registrar" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: "Email e senha obrigatórios" });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    const senhaValida = await bcrypt.compare(password, user.password);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ ok: true, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao fazer login" });
  }
});

// GET listas (protegido)
app.get("/api/lista", autenticar, (req, res) => {
  try {
    const listas = shoppingLists.filter(l => l.userId === req.userId);
    return res.json(listas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar listas" });
  }
});

// POST criar lista (protegido)
app.post("/api/lista", autenticar, (req, res) => {
  try {
    const { title, items } = req.body;

    if (!title) {
      return res.status(400).json({ erro: "Título obrigatório" });
    }

    const id = Math.random().toString(36).substr(2, 9);
    const lista = {
      id,
      title,
      items: items || [],
      userId: req.userId,
      createdAt: new Date(),
    };

    shoppingLists.push(lista);

    return res.status(201).json(lista);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao criar lista" });
  }
});

// PUT atualizar lista
app.put("/api/lista/:id", autenticar, (req, res) => {
  try {
    const { id } = req.params;
    const { title, items } = req.body;

    const lista = shoppingLists.find(l => l.id === id && l.userId === req.userId);

    if (!lista) {
      return res.status(404).json({ erro: "Lista não encontrada" });
    }

    if (title) lista.title = title;
    if (items) lista.items = items;

    return res.json(lista);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao atualizar lista" });
  }
});

// DELETE lista
app.delete("/api/lista/:id", autenticar, (req, res) => {
  try {
    const { id } = req.params;

    const idx = shoppingLists.findIndex(l => l.id === id && l.userId === req.userId);

    if (idx === -1) {
      return res.status(404).json({ erro: "Lista não encontrada" });
    }

    shoppingLists.splice(idx, 1);

    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao deletar lista" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
