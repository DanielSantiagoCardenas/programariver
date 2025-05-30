require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const usuariosRouter = require('./routes/usuarios');
const eventosRouter = require('./routes/eventos');
const movimientosRouter = require('./routes/movimientos');

const app = express();
const port = 3000;

// Configuración
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Middleware para log de rutas
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Ruta principal
app.get('/', (req, res) => {
    res.redirect('/eventos');
});

// Usar los routers
app.use('/eventos', eventosRouter);
app.use('/usuarios', usuariosRouter);
app.use('/movimientos', movimientosRouter);

// Manejo de errores 404
app.use((req, res, next) => {
    console.log('Ruta no encontrada:', req.method, req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    if (req.accepts('json')) {
        res.status(404).json({ success: false, message: 'Página no encontrada' });
    } else {
        res.status(404).send('Página no encontrada');
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 