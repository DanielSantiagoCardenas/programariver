const express = require('express');
const router = express.Router();
const dataManager = require('../data/data-manager');

router.get('/', async (req, res) => {
    try {
        // Inicializar variables
        let totalPagosParticipantes = 0;
        let totalIngresosManuales = 0;
        let totalRetirado = 0;
        let totalMovimientos = [];

        // Cargar eventos
        const eventos = await dataManager.cargarEventos() || [];
        console.log('Eventos cargados:', eventos.length);

        // Procesar cada evento y armar resumen
        const resumenEventos = (eventos || []).map(evento => {
            evento.participantes = evento.participantes || [];
            evento.movimientos = evento.movimientos || [];

            // Pagos de participantes
            const pagosParticipantes = evento.participantes.reduce((total, p) => total + (p.montoPagado || 0), 0);
            // Ingresos manuales
            const ingresosManuales = evento.movimientos.filter(m => m.tipo === 'ingreso').reduce((total, m) => total + (m.monto || 0), 0);
            // Total recaudado por evento
            const totalRecaudadoEvento = pagosParticipantes + ingresosManuales;
            // Total retirado
            const retiradoEvento = evento.movimientos.filter(m => m.tipo === 'egreso').reduce((total, m) => total + (m.monto || 0), 0);
            // Saldo
            const saldoEvento = totalRecaudadoEvento - retiradoEvento;

            // Sumar a los totales globales
            totalPagosParticipantes += pagosParticipantes;
            totalIngresosManuales += ingresosManuales;
            totalRetirado += retiradoEvento;

            // Movimientos globales
            evento.movimientos.forEach(mov => {
                totalMovimientos.push({
                    ...mov,
                    evento: evento.nombre
                });
            });

            return {
                nombre: evento.nombre,
                pagosParticipantes,
                ingresosManuales,
                totalRecaudadoEvento,
                retiradoEvento,
                saldoEvento
            };
        });

        // Total recaudado solo pagos de participantes
        const totalRecaudado = totalPagosParticipantes;
        // Saldo actual: pagos + ingresos - egresos
        const saldoActual = totalPagosParticipantes + totalIngresosManuales - totalRetirado;

        console.log('--- RESUMEN GLOBAL ---');
        console.log('totalPagosParticipantes:', totalPagosParticipantes);
        console.log('totalIngresosManuales:', totalIngresosManuales);
        console.log('totalRecaudado:', totalRecaudado);
        console.log('totalRetirado:', totalRetirado);
        console.log('saldoActual:', saldoActual);

        console.log('Totales calculados:', {
            totalRecaudado,
            totalRetirado,
            saldoActual,
            totalMovimientos: totalMovimientos.length
        });

        // Ordenar movimientos por fecha (más recientes primero)
        totalMovimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Renderizar vista con los datos calculados
        res.render('movimientos-globales', {
            resumenEventos,
            totalRecaudado: totalRecaudado || 0,
            totalRetirado: totalRetirado || 0,
            saldoActual: saldoActual || 0,
            movimientos: totalMovimientos
        });
    } catch (error) {
        console.error('Error al cargar los movimientos:', error);
        res.status(500).send('Error al cargar los movimientos');
    }
});

module.exports = router; 