const express = require('express');
const router = express.Router();
const { cargarEventos, guardarEventos, cargarUsuarios } = require('../data/data-manager');

// Middleware para logging
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Rutas específicas primero
router.post('/pagos/:id', async (req, res) => {
    try {
        console.log('Registrando pago - Evento ID:', req.params.id);
        console.log('Datos del pago:', req.body);
        
        const eventos = await cargarEventos();
        const evento = eventos.find(e => e.id.toString() === req.params.id.toString());
        
        if (!evento) {
            console.log('Evento no encontrado');
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        const participante = evento.participantes.find(p => p.id.toString() === req.body.participanteId.toString());
        
        if (!participante) {
            console.log('Participante no encontrado');
            return res.status(404).json({ success: false, message: 'Participante no encontrado' });
        }

        const nuevoPago = {
            id: Date.now().toString(),
            fecha: req.body.fecha || new Date().toISOString().split('T')[0],
            monto: Number(req.body.monto),
            observacion: req.body.observacion || ''
        };

        if (!participante.pagos) {
            participante.pagos = [];
        }
        participante.pagos.push(nuevoPago);
        
        participante.montoPagado = (participante.montoPagado || 0) + Number(req.body.monto);
        participante.estado = participante.montoPagado >= participante.montoTotal ? 'pagado' : 'abonado';
        
        await guardarEventos(eventos);
        console.log('Pago registrado exitosamente');
        res.json({ success: true });
    } catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({ success: false, message: 'Error al registrar el pago' });
    }
});

// Ruta para editar un pago
router.put('/pagos/editar/:eventoId/:pagoId', async (req, res) => {
    try {
        console.log('Editando pago - Evento ID:', req.params.eventoId, 'Pago ID:', req.params.pagoId);
        console.log('Datos del pago:', req.body);
        
        const eventos = await cargarEventos();
        const evento = eventos.find(e => e.id.toString() === req.params.eventoId.toString());
        
        if (!evento) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        const participante = evento.participantes.find(p => {
            return p.pagos && p.pagos.some(pago => pago.id === req.params.pagoId);
        });
        
        if (!participante) {
            return res.status(404).json({ success: false, message: 'Participante no encontrado' });
        }

        const pago = participante.pagos.find(p => p.id === req.params.pagoId);
        if (!pago) {
            return res.status(404).json({ success: false, message: 'Pago no encontrado' });
        }

        // Actualizar el monto pagado del participante
        participante.montoPagado = participante.montoPagado - pago.monto + Number(req.body.monto);
        participante.estado = participante.montoPagado >= participante.montoTotal ? 'pagado' : 'abonado';

        // Actualizar los datos del pago
        pago.monto = Number(req.body.monto);
        pago.fecha = req.body.fecha || pago.fecha;
        pago.observacion = req.body.observacion || pago.observacion;

        await guardarEventos(eventos);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al editar pago:', error);
        res.status(500).json({ success: false, message: 'Error al editar el pago' });
    }
});

// Ruta para eliminar un pago
router.delete('/pagos/eliminar/:eventoId/:pagoId', async (req, res) => {
    try {
        console.log('Eliminando pago - Evento ID:', req.params.eventoId, 'Pago ID:', req.params.pagoId);
        
        const eventos = await cargarEventos();
        const evento = eventos.find(e => e.id.toString() === req.params.eventoId.toString());
        
        if (!evento) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        const participante = evento.participantes.find(p => {
            return p.pagos && p.pagos.some(pago => pago.id === req.params.pagoId);
        });
        
        if (!participante) {
            return res.status(404).json({ success: false, message: 'Participante no encontrado' });
        }

        const pago = participante.pagos.find(p => p.id === req.params.pagoId);
        if (!pago) {
            return res.status(404).json({ success: false, message: 'Pago no encontrado' });
        }

        // Actualizar el monto pagado del participante
        participante.montoPagado -= pago.monto;
        participante.estado = participante.montoPagado >= participante.montoTotal ? 'pagado' : 'abonado';

        // Eliminar el pago
        participante.pagos = participante.pagos.filter(p => p.id !== req.params.pagoId);

        await guardarEventos(eventos);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar pago:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el pago' });
    }
});

// Rutas de participantes
router.post('/participantes/agregar/:eventoId', async (req, res) => {
    try {
        console.log('Agregando participante al evento:', req.params.eventoId);
        console.log('Datos del participante:', req.body);
        
        const eventos = await cargarEventos();
        const evento = eventos.find(e => e.id.toString() === req.params.eventoId.toString());
        
        if (!evento) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        const nuevoParticipante = {
            id: req.body.usuarioId,
            montoTotal: Number(req.body.monto),
            montoPagado: 0,
            estado: 'pendiente',
            pagos: []
        };

        if (!evento.participantes) {
            evento.participantes = [];
        }
        evento.participantes.push(nuevoParticipante);
        await guardarEventos(eventos);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error al agregar participante:', error);
        res.status(500).json({ success: false, message: 'Error al agregar el participante' });
    }
});

router.post('/participantes/eliminar/:eventoId/:participanteId', async (req, res) => {
    try {
        console.log('Eliminando participante:', req.params.participanteId, 'del evento:', req.params.eventoId);
        
        const eventos = await cargarEventos();
        const evento = eventos.find(e => e.id.toString() === req.params.eventoId.toString());
        
        if (!evento) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        const participanteIndex = evento.participantes.findIndex(p => p.id.toString() === req.params.participanteId.toString());
        
        if (participanteIndex === -1) {
            return res.status(404).json({ success: false, message: 'Participante no encontrado' });
        }

        evento.participantes.splice(participanteIndex, 1);
        await guardarEventos(eventos);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar participante:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el participante' });
    }
});

// Rutas de movimientos
router.get('/movimientos/obtener/:eventoId', async (req, res) => {
    try {
        const eventos = await cargarEventos();
        const evento = eventos.find(e => e.id.toString() === req.params.eventoId.toString());
        
        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        const totalPagosParticipantes = evento.participantes.reduce((total, p) => total + (p.montoPagado || 0), 0);
        const movimientosIngresos = evento.movimientos ? evento.movimientos
            .filter(m => m.tipo === 'ingreso')
            .reduce((total, m) => total + m.monto, 0) : 0;
        const movimientosEgresos = evento.movimientos ? evento.movimientos
            .filter(m => m.tipo === 'egreso')
            .reduce((total, m) => total + m.monto, 0) : 0;

        const totalRecaudado = totalPagosParticipantes;
        const totalRetirado = movimientosEgresos;
        const saldoActual = totalPagosParticipantes + movimientosIngresos - movimientosEgresos;

        res.render('movimientos-evento', { 
            evento,
            totalRecaudado,
            totalRetirado,
            saldoActual
        });
    } catch (error) {
        console.error('Error al cargar movimientos:', error);
        res.status(500).send('Error al cargar los movimientos');
    }
});

router.post('/movimientos/agregar/:eventoId', async (req, res) => {
    try {
        const eventos = await cargarEventos();
        const evento = eventos.find(e => e.id === req.params.eventoId);
        
        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        const nuevoMovimiento = {
            id: Date.now().toString(),
            tipo: req.body.tipo,
            monto: Number(req.body.monto),
            fecha: new Date(req.body.fecha).toISOString(),
            descripcion: req.body.descripcion
        };

        if (!evento.movimientos) {
            evento.movimientos = [];
        }
        evento.movimientos.push(nuevoMovimiento);
        await guardarEventos(eventos);
        res.redirect(`/eventos/movimientos/obtener/${evento.id}`);
    } catch (error) {
        console.error('Error al crear movimiento:', error);
        res.status(500).send('Error al crear el movimiento');
    }
});

router.put('/movimientos/editar/:eventoId/:movimientoId', async (req, res) => {
    try {
        console.log('Editando movimiento - Evento ID:', req.params.eventoId, 'Movimiento ID:', req.params.movimientoId);
        console.log('Datos del movimiento:', req.body);
        
        const eventos = await cargarEventos();
        const evento = eventos.find(e => e.id.toString() === req.params.eventoId.toString());
        
        if (!evento) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        const movimiento = evento.movimientos.find(m => m.id === req.params.movimientoId);
        if (!movimiento) {
            return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
        }

        // Actualizar los datos del movimiento
        movimiento.tipo = req.body.tipo;
        movimiento.monto = Number(req.body.monto);
        movimiento.fecha = new Date(req.body.fecha).toISOString();
        movimiento.descripcion = req.body.descripcion;

        await guardarEventos(eventos);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al editar movimiento:', error);
        res.status(500).json({ success: false, message: 'Error al editar el movimiento' });
    }
});

router.delete('/movimientos/eliminar/:eventoId/:movimientoId', async (req, res) => {
    try {
        const eventos = await cargarEventos();
        const evento = eventos.find(e => e.id === req.params.eventoId);
        
        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        evento.movimientos = evento.movimientos.filter(m => m.id !== req.params.movimientoId);
        await guardarEventos(eventos);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error al eliminar movimiento:', error);
        res.status(500).send('Error al eliminar el movimiento');
    }
});

// Rutas básicas de eventos
router.get('/detalle/:id', async (req, res) => {
    try {
        console.log('Cargando detalle del evento:', req.params.id);
        const eventos = await cargarEventos();
        const usuarios = await cargarUsuarios();
        const evento = eventos.find(e => e.id === req.params.id);
        
        if (!evento) {
            console.log('Evento no encontrado');
            return res.status(404).send('Evento no encontrado');
        }

        res.render('evento-detalle', { evento, usuarios });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al cargar el evento');
    }
});

router.get('/', async (req, res) => {
    try {
        const eventos = await cargarEventos();
        res.render('eventos', { eventos });
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        res.status(500).send('Error al cargar los eventos');
    }
});

router.post('/nuevo', async (req, res) => {
    try {
        const eventos = await cargarEventos();
        const nuevoEvento = {
            id: Date.now().toString(),
            nombre: req.body.nombre,
            fecha: req.body.fecha,
            valorTotal: Number(req.body.valorTotal),
            descripcion: req.body.descripcion,
            participantes: [],
            movimientos: []
        };
        eventos.push(nuevoEvento);
        await guardarEventos(eventos);
        res.redirect('/eventos');
    } catch (error) {
        console.error('Error al crear evento:', error);
        res.status(500).send('Error al crear el evento');
    }
});

// Ruta para eliminar un evento
router.delete('/:id', async (req, res) => {
    try {
        const eventos = await cargarEventos();
        const eventoIndex = eventos.findIndex(e => e.id === req.params.id);
        
        if (eventoIndex === -1) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        eventos.splice(eventoIndex, 1);
        await guardarEventos(eventos);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el evento' });
    }
});

module.exports = router; 