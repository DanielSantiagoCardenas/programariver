const express = require('express');
const router = express.Router();
const { cargarUsuarios, guardarUsuarios, cargarEventos, guardarEventos } = require('../data/data-manager');

// Ruta principal para mostrar usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await cargarUsuarios();
        res.render('usuarios', { usuarios });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        res.status(500).send('Error al cargar los usuarios');
    }
});

// Ruta para crear un nuevo usuario
router.post('/agregar', async (req, res) => {
    try {
        const usuarios = await cargarUsuarios();
        const nuevoUsuario = {
            id: Date.now().toString(),
            nombre: req.body.nombre,
            telefono: req.body.telefono
        };
        usuarios.push(nuevoUsuario);
        await guardarUsuarios(usuarios);
        res.redirect('/usuarios');
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).send('Error al crear el usuario');
    }
});

// Ruta para eliminar un usuario
router.delete('/eliminar/:id', async (req, res) => {
    try {
        const usuarios = await cargarUsuarios();
        const usuarioId = req.params.id;
        const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
        
        if (usuarioIndex === -1) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        usuarios.splice(usuarioIndex, 1);
        await guardarUsuarios(usuarios);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el usuario' });
    }
});

// Ruta para actualizar un usuario
router.post('/actualizar/:id', async (req, res) => {
    try {
        const usuarioId = req.params.id;
        const datosActualizados = req.body;

        // Cargar usuarios actuales
        const usuarios = await cargarUsuarios();
        const usuario = usuarios.find(u => u.id === usuarioId);

        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Actualizar datos del usuario
        Object.assign(usuario, datosActualizados);
        await guardarUsuarios(usuarios);

        // Actualizar el usuario en todos los eventos donde participa
        const eventos = await cargarEventos();
        let seActualizaronEventos = false;

        console.log('ID del usuario a actualizar:', usuarioId);
        console.log('Datos actualizados del usuario:', usuario);

        // Recorrer todos los eventos
        for (const evento of eventos) {
            if (evento.participantes) {
                console.log('Revisando evento:', evento.nombre);
                // Recorrer todos los participantes del evento
                for (const participante of evento.participantes) {
                    console.log('Comparando participante ID:', participante.id, 'con usuario ID:', usuarioId);
                    if (participante.id === usuarioId) {
                        console.log('¡Coincidencia encontrada! Actualizando participante:', participante);
                        // Actualizar todos los datos del participante con los del usuario
                        participante.nombre = usuario.nombre;
                        participante.telefono = usuario.telefono;
                        seActualizaronEventos = true;
                        console.log('Participante actualizado:', participante);
                    }
                }
            }
        }

        if (seActualizaronEventos) {
            console.log('Guardando cambios en eventos...');
            await guardarEventos(eventos);
            console.log('Cambios guardados exitosamente');
        } else {
            console.log('No se encontraron participantes para actualizar');
        }

        res.json({ 
            success: true, 
            message: 'Usuario actualizado correctamente',
            usuario: usuario
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
    }
});

module.exports = router; 