// Só carrega dotenv em desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const crypto = require("crypto");

// Verifica se DATABASE_URL está configurado
if (!process.env.DATABASE_URL) {
  console.error('ERRO: DATABASE_URL não está configurado!');
  throw new Error('DATABASE_URL não está configurado');
}

if (!process.env.JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não está configurado!');
  throw new Error('JWT_SECRET não está configurado');
}

let pool;
try {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
} catch (error) {
  console.error('Erro ao criar pool do PostgreSQL:', error);
  throw error;
}
const app = express();

app.use(cors());
app.use(express.json());

// Middleware de autenticação
async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? 'Presente' : 'Ausente');
  
  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.log('Token não fornecido');
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    console.log('Token válido, userId:', req.userId);
    next();
  } catch (err) {
    console.error('Erro ao verificar token:', err.message);
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

      const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return res.json({ ok: true, token });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao fazer login" });
  }
});

// Solicitar recuperação de senha
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: "Email obrigatório" });
    }

    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);
      
      // Sempre retorna sucesso para não revelar se o email existe
      if (result.rowCount === 0) {
        return res.json({ ok: true, mensagem: "Se o email existir, você receberá instruções para recuperar sua senha" });
      }

      // Gerar token de recuperação (expira em 1 hora)
      const resetToken = jwt.sign(
        { userId: result.rows[0].id, type: 'password-reset' },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // URL de reset (em produção, isso seria enviado por email)
      const resetUrl = `${process.env.FRONTEND_URL || 'https://compras-lista.vercel.app'}/reset-password?token=${resetToken}`;
      
      // TODO: Enviar email com o link de reset
      // Por enquanto, vamos logar o token (em produção, usar serviço de email)
      console.log(`Token de recuperação para ${email}: ${resetToken}`);
      console.log(`URL de reset: ${resetUrl}`);
      
      // Em produção, você usaria um serviço como SendGrid, Resend, ou Nodemailer
      // Exemplo com Resend:
      // await resend.emails.send({
      //   from: 'noreply@seudominio.com',
      //   to: email,
      //   subject: 'Recuperação de Senha',
      //   html: `<p>Clique no link para redefinir sua senha: <a href="${resetUrl}">${resetUrl}</a></p>`
      // });

      return res.json({ 
        ok: true, 
        mensagem: "Se o email existir, você receberá instruções para recuperar sua senha",
        // Remover em produção - apenas para desenvolvimento
        ...(process.env.NODE_ENV === 'development' && { resetUrl })
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao processar solicitação de recuperação" });
  }
});

// Resetar senha com token
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ erro: "Token e senha obrigatórios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres" });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== 'password-reset') {
        return res.status(400).json({ erro: "Token inválido" });
      }
    } catch (err) {
      return res.status(400).json({ erro: "Token inválido ou expirado" });
    }

    const client = await pool.connect();
    try {
      // Verificar se o usuário existe
      const userCheck = await client.query('SELECT id FROM "User" WHERE id = $1', [decoded.userId]);
      if (userCheck.rowCount === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      // Hash da nova senha
      const senhaHash = await bcrypt.hash(password, 10);

      // Atualizar senha
      await client.query('UPDATE "User" SET password = $1 WHERE id = $2', [senhaHash, decoded.userId]);

      return res.json({ ok: true, mensagem: "Senha redefinida com sucesso" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao redefinir senha" });
  }
});

// GET listas (protegido)
app.get("/api/lista", autenticar, async (req, res) => {
  try {
    console.log('GET /api/lista - userId:', req.userId);
    
    if (!req.userId) {
      console.error('userId não definido após autenticação');
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }
    
    const client = await pool.connect();
    try {
      console.log('Executando query com userId:', req.userId);
      const result = await client.query(
        'SELECT id, title, items, "createdAt" FROM "ShoppingList" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
        [req.userId]
      );
      console.log('Query executada com sucesso. Listas encontradas:', result.rows.length);
      return res.json(result.rows);
    } catch (dbError) {
      console.error('Erro na query do banco:', dbError);
      return res.status(500).json({ 
        erro: "Erro ao buscar listas no banco de dados", 
        detalhes: dbError.message,
        stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro geral ao buscar listas:', error);
    return res.status(500).json({ 
      erro: "Erro ao buscar listas", 
      detalhes: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST criar lista (protegido)
app.post("/api/lista", autenticar, async (req, res) => {
  try {
    const { title, items } = req.body;
    console.log('POST /api/lista - userId:', req.userId, 'title:', title);

    if (!title) {
      return res.status(400).json({ erro: "Título obrigatório" });
    }

    if (!req.userId) {
      console.error('userId não definido após autenticação');
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    const client = await pool.connect();
    try {
      const id = crypto.randomUUID();
      console.log('Criando lista com id:', id);
      const result = await client.query(
        'INSERT INTO "ShoppingList" (id, title, items, "userId") VALUES ($1, $2, $3::jsonb, $4) RETURNING id, title, items, "createdAt"',
        [id, title, JSON.stringify(items || []), req.userId]
      );
      console.log('Lista criada com sucesso:', result.rows[0]);
      return res.status(201).json(result.rows[0]);
    } catch (dbError) {
      console.error('Erro na query do banco ao criar lista:', dbError);
      return res.status(500).json({ 
        erro: "Erro ao criar lista no banco de dados", 
        detalhes: dbError.message,
        stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro geral ao criar lista:', error);
    return res.status(500).json({ 
      erro: "Erro ao criar lista", 
      detalhes: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT atualizar lista
app.put("/api/lista/:id", autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, items } = req.body;

    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT "userId", title, items FROM "ShoppingList" WHERE id = $1', [id]);
      if (existing.rowCount === 0 || existing.rows[0].userId !== req.userId) {
        return res.status(404).json({ erro: "Lista não encontrada" });
      }

      const updated = await client.query(
        'UPDATE "ShoppingList" SET title = $1, items = $2::jsonb WHERE id = $3 RETURNING id, title, items, "createdAt"',
        [title ?? existing.rows[0].title, JSON.stringify(items ?? existing.rows[0].items), id]
      );

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
      const existing = await client.query('SELECT "userId" FROM "ShoppingList" WHERE id = $1', [id]);  
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

// Handler para Vercel serverless functions
// O Vercel com @vercel/node suporta Express apps diretamente
module.exports = app;
