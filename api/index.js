const app = require('../server/index.js');

// Handler para Vercel serverless functions
// O Vercel remove o /api do path ao rotear, então precisamos adicionar de volta
module.exports = (req, res) => {
  // Adiciona /api de volta ao path original
  const originalUrl = req.url;
  req.url = `/api${originalUrl}`;
  
  // Chama o app Express
  return app(req, res);
};
