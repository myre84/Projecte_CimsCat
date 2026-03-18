// Importo Express per construir l'API HTTP.
const express = require('express');

// Importo CORS per permetre peticions des del frontend (origen diferent).
const cors = require('cors');

// Importo path per construir rutes de fitxers de forma segura.
const path = require('path');

// Importo les rutes de health check.
const healthRoutes = require('./routes/health.routes');

// Creo la instancia principal de l'aplicacio Express.
const app = express();

// Activo CORS globalment.
app.use(cors());

// Fa que Express entengui JSON al body de les peticions.
app.use(express.json());

// Exposo la carpeta uploads com a recursos estatics.
// Exemple: un fitxer a backend/uploads/publicacions/x.jpg sera accessible a
// http://localhost:3000/uploads/publicacions/x.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Registro les rutes del modul health al path arrel.
app.use('/', healthRoutes);

// Exporto l'app per poder arrencar-la des de server.js
module.exports = app;
