// Importo Express per construir l'API HTTP.
const express = require('express');

// Importo CORS per permetre peticions des del frontend (origen diferent).
const cors = require('cors');

// Importo path per construir rutes de fitxers de forma segura.
const path = require('path');

// Importo les rutes de health check.
const healthRoutes = require('./routes/health.routes');

// Importo el router del modul d'autenticacio (register, login, me).
const authRoutes = require('./modules/auth/auth.routes');

// Importo el router public del modul de cims (llistat + detall).
// Aqui hi viuen:
// - GET /peaks
// - GET /peaks/:id
const peaksRoutes = require('./modules/peaks/peaks.routes');

// Importo router de pujada de fitxers (POST /uploads/...).
const uploadsRoutes = require('./modules/uploads/uploads.routes');

// Importo router CRUD de publicacions.
const publicacionsRoutes = require('./modules/publicacions/publicacions.routes');

// Importo router del modul comments (DELETE /comments/:id).
const commentsRoutes = require('./modules/comments/comments.routes');

// Importo el router del modul users.
// Aquest modul encapsula endpoints de:
// - perfil public
// - actualitzacio de perfil propi
// - publicacions d'usuari
// - cims guardats (ruta /saved)
const usersRoutes = require('./modules/users/users.routes');

// Creo la instancia principal de l'aplicacio Express.
const app = express();

// Activo CORS globalment.
app.use(cors());

// Fa que Express entengui JSON al body de les peticions.
app.use(express.json());

// Primer munto POST /uploads/... per gestionar pujades.
app.use('/uploads', uploadsRoutes);

// Exposo la carpeta uploads com a recursos estatics.
// Exemple: un fitxer a backend/uploads/publicacions/x.jpg sera accessible a
// http://localhost:3000/uploads/publicacions/x.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Registro les rutes a l'app principal.
// Tot el modul auth queda penjat sota /auth.
app.use('/auth', authRoutes);

// Tot el modul peaks queda penjat sota /peaks i es PUBLIC (sense auth middleware).
app.use('/peaks', peaksRoutes);

// Modul CRUD de publicacions.
app.use('/publicacions', publicacionsRoutes);

// Modul comments separat per endpoint global DELETE /comments/:id.
app.use('/comments', commentsRoutes);

// Munto el modul users sota /users.
// Dins del propi router ja s'aplica requireAuth nomes on toca.
app.use('/users', usersRoutes);

// Health es deixa a arrel per comprovacions rapides de vida del backend.
app.use('/', healthRoutes);

// Exporto l'app per poder arrencar-la des de server.js
module.exports = app;
