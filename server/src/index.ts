import express from "express";
import cors from "cors";
import { register, login } from "./routes/auth";
import { getListas, createLista, updateLista, deleteLista } from "./routes/lista";
import { autenticar } from "./middleware/auth";

const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

// Rotas protegidas
app.get("/api/lista", autenticar, getListas);
app.post("/api/lista", autenticar, createLista);
app.put("/api/lista/:id", autenticar, updateLista);
app.delete("/api/lista/:id", autenticar, deleteLista);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
