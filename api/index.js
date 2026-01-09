// Handler para Vercel serverless functions
let app;
try {
  app = require('../server/index.js');
} catch (error) {
  console.error('Erro ao carregar o servidor:', error);
  module.exports = (req, res) => {
    res.status(500).json({ erro: 'Erro ao inicializar servidor', detalhes: error.message });
  };
}

module.exports = async (req, res) => {
  try {
    // O Vercel passa o path sem o /api quando roteia para /api/index.js
    // Então se a URL é /auth/login, precisamos adicionar /api de volta
    const originalUrl = req.url || req.path || '';
    
    // Se a URL não começa com /api, adiciona
    if (!originalUrl.startsWith('/api')) {
      req.url = `/api${originalUrl}`;
      if (req.path) {
        req.path = `/api${originalUrl}`;
      }
    }
    
    // Chama o app Express
    return app(req, res);
  } catch (error) {
    console.error('Erro no handler da API:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
  }
};
