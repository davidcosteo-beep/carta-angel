const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const dispositivosRoutes = require('./routes/dispositivosRoutes');
const verifyToken = require('./middleware/verifyToken');
const requireRole = require('./middleware/requireRole');
const {
  ROLES
} = require('./utils/roles');

const pdfRoutes =
  require('./routes/pdfRoutes');

const pacientesRoutes =
  require('./routes/pacientesRoutes');

const citasRoutes =
  require('./routes/citas');

const app = express();

const frontendDistPath = path.resolve(
  __dirname,
  '..',
  '..',
  'dist'
);

const frontendIndexPath = path.join(
  frontendDistPath,
  'index.html'
);

const pdfStoragePath = path.resolve(
  __dirname,
  '..',
  'storage',
  'pdfs'
);

app.use(cors());
app.use(express.json());

app.use(
  '/pdfs',
  express.static(pdfStoragePath)
);

app.get('/health', (req, res) => {

  res.json({
    ok: true,
    service: 'kabala-pro-api',
    status: 'running',
    timestamp: new Date().toISOString()
  });

});

app.use('/api/auth', authRoutes);

app.use('/api/usuarios', usuariosRoutes);

app.use('/api/dispositivos', dispositivosRoutes);

app.use(
  '/api/pdf',
  verifyToken,
  requireRole(ROLES.TERAPEUTA),
  pdfRoutes
);

app.use(
  '/api/pacientes',
  verifyToken,
  requireRole(ROLES.TERAPEUTA, ROLES.AUXILIAR),
  pacientesRoutes
);

app.use(
  '/api/citas',
  verifyToken,
  requireRole(ROLES.TERAPEUTA, ROLES.AUXILIAR),
  citasRoutes
);

if (fs.existsSync(frontendDistPath)) {

  app.use(
    express.static(frontendDistPath)
  );

}

app.use((req, res, next) => {

  const requestPath = req.path || '';

  if (
    requestPath.startsWith('/api') ||
    requestPath === '/health' ||
    requestPath.startsWith('/pdfs')
  ) {

    return next();

  }

  if (!fs.existsSync(frontendIndexPath)) {

    return res.status(503).json({
      ok: false,
      message:
        'Frontend no compilado. Ejecuta npm run build en la raiz del proyecto.'
    });

  }

  return res.sendFile(frontendIndexPath);

});

module.exports = app;
