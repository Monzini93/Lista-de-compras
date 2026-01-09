import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface AuthRequest extends Request {
  userId?: string;
}

export async function getListas(req: AuthRequest, res: Response) {
  try {
    const listas = await prisma.shoppingList.findMany({
      where: { userId: req.userId },
    });

    return res.json(listas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar listas" });
  }
}

export async function createLista(req: AuthRequest, res: Response) {
  try {
    const { title, items } = req.body;

    if (!title) {
      return res.status(400).json({ erro: "Título obrigatório" });
    }

    const lista = await prisma.shoppingList.create({
      data: {
        title,
        items: items || [],
        userId: req.userId!,
      },
    });

    return res.status(201).json(lista);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao criar lista" });
  }
}

export async function updateLista(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, items } = req.body;

    const lista = await prisma.shoppingList.findFirst({
      where: { id, userId: req.userId },
    });

    if (!lista) {
      return res.status(404).json({ erro: "Lista não encontrada" });
    }

    const updated = await prisma.shoppingList.update({
      where: { id },
      data: {
        title: title || lista.title,
        items: items || lista.items,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao atualizar lista" });
  }
}

export async function deleteLista(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const lista = await prisma.shoppingList.findFirst({
      where: { id, userId: req.userId },
    });

    if (!lista) {
      return res.status(404).json({ erro: "Lista não encontrada" });
    }

    await prisma.shoppingList.delete({ where: { id } });

    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao deletar lista" });
  }
}
