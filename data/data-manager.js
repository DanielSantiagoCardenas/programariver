const fs = require('fs').promises;
const path = require('path');

const USUARIOS_FILE = path.join(__dirname, 'usuarios.json');
const EVENTOS_FILE = path.join(__dirname, 'eventos.json');
const MOVIMIENTOS_FILE = path.join(__dirname, 'movimientos.json');

async function cargarUsuarios() {
    try {
        const data = await fs.readFile(USUARIOS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        return [];
    }
}

async function guardarUsuarios(usuarios) {
    try {
        await fs.writeFile(USUARIOS_FILE, JSON.stringify(usuarios, null, 2));
    } catch (error) {
        console.error('Error al guardar usuarios:', error);
        throw error;
    }
}

async function cargarEventos() {
    try {
        const data = await fs.readFile(EVENTOS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        return [];
    }
}

async function guardarEventos(eventos) {
    try {
        await fs.writeFile(EVENTOS_FILE, JSON.stringify(eventos, null, 2));
    } catch (error) {
        console.error('Error al guardar eventos:', error);
        throw error;
    }
}

async function cargarMovimientos() {
    try {
        const data = await fs.readFile(MOVIMIENTOS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al cargar movimientos:', error);
        return [];
    }
}

async function guardarMovimientos(movimientos) {
    try {
        await fs.writeFile(MOVIMIENTOS_FILE, JSON.stringify(movimientos, null, 2));
    } catch (error) {
        console.error('Error al guardar movimientos:', error);
        throw error;
    }
}

module.exports = {
    cargarUsuarios,
    guardarUsuarios,
    cargarEventos,
    guardarEventos,
    cargarMovimientos,
    guardarMovimientos
}; 