import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: "Email e senha obrigatórios" });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: senhaHash,
      },
    });

    return res.status(201).json({ ok: true, userId: user.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao registrar" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: "Email e senha obrigatórios" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    const senhaValida = await bcrypt.compare(password, user.password);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({ ok: true, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao fazer login" });
  }
}
