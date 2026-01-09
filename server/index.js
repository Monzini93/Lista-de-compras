require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const crypto = require("crypto");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();

app.use(cors());
app.use(express.json());

// Middleware de autenticação
async function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
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

    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);        
      if (existing.rowCount > 0) {
        return res.status(409).json({ erro: "Email já cadastrado" });
      }

      const senhaHash = await bcrypt.hash(password, 10);
      const id = crypto.randomUUID();

      const insert = await client.query(
        'INSERT INTO "User" (id, email, password) VALUES ($1, $2, $3) RETURNING id',
        [id, email, senhaHash]
      );

      return res.status(201).json({ ok: true, userId: insert.rows[0].id });
    } finally {
      client.release();
    }
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

    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, password FROM "User" WHERE email = $1', [email]);
      if (result.rowCount === 0) {
        return res.status(401).json({ erro: "Email ou senha incorretos" });
      }

      const user = result.rows[0];
      const senhaValida = await bcrypt.compare(password, user.password);
      if (!senhaValida) {
        return res.status(401).json({ erro: "Email ou senha incorretos" });
      }

      const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, { expiresIn: "7d" })
;                                                                                                          return res.json({ ok: true, token });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao fazer login" });
  }
});

// GET listas (protegido)
app.get("/api/lista", autenticar, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, title, items, createdAt FROM "ShoppingList" WHERE userId = $1 ORDER BY createdAt DESC', [req.userId]);
      return res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar listas" });
  }
});

// POST criar lista (protegido)
app.post("/api/lista", autenticar, async (req, res) => {
  try {
    const { title, items } = req.body;

    if (!title) {
      return res.status(400).json({ erro: "Título obrigatório" });
    }

    const client = await pool.connect();
    try {
      const id = crypto.randomUUID();
      const result = await client.query('INSERT INTO "ShoppingList" (id, title, items, userId) VALUES ($1, $2, $3::jsonb, $4) RETURNING id, title, items, createdAt', [id, title, JSON.stringify(items || []), req.userId]);
      return res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao criar lista" });
  }
});

// PUT atualizar lista
app.put("/api/lista/:id", autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, items } = req.body;

    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT userId, title, items FROM "ShoppingList" WHERE id = $1', [id]);
      if (existing.rowCount === 0 || existing.rows[0].userId !== req.userId) {
        return res.status(404).json({ erro: "Lista não encontrada" });
      }

      const updated = await client.query('UPDATE "ShoppingList" SET title = $1, items = $2::jsonb WHERE id = $3 RETURNING id, title, items, createdAt', [title ?? existing.rows[0].title, JSON.stringify(items ?? existing.rows[0].items), id]);

      return res.json(updated.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao atualizar lista" });
  }
});

// DELETE lista
app.delete("/api/lista/:id", autenticar, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT userId FROM "ShoppingList" WHERE id = $1', [id]);  
      if (existing.rowCount === 0 || existing.rows[0].userId !== req.userId) {
        return res.status(404).json({ erro: "Lista não encontrada" });
      }

      await client.query('DELETE FROM "ShoppingList" WHERE id = $1', [id]);
      return res.json({ ok: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao deletar lista" });
  }
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
