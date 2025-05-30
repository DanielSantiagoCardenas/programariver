# Tesorería River Plate

Sistema de gestión de tesorería para River Plate, desarrollado con Node.js y Express.

## Características

- Gestión de usuarios
- Creación y gestión de eventos
- Control de pagos y participantes
- Exportación de datos a Excel
- Interfaz moderna con los colores de River Plate

## Requisitos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd river-tesoreria
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar la aplicación:
```bash
npm start
```

Para desarrollo, puedes usar:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
river-tesoreria/
├── app.js              # Archivo principal de la aplicación
├── data/              # Directorio para archivos JSON
│   ├── usuarios.json  # Datos de usuarios
│   └── eventos.json   # Datos de eventos
├── public/            # Archivos estáticos
│   ├── css/          # Estilos CSS
│   └── img/          # Imágenes
├── views/            # Plantillas EJS
└── package.json      # Configuración y dependencias
```

## Uso

1. **Gestión de Usuarios**
   - Agregar nuevos usuarios
   - Ver lista de usuarios
   - Editar información de usuarios
   - Eliminar usuarios

2. **Gestión de Eventos**
   - Crear nuevos eventos
   - Ver lista de eventos
   - Agregar participantes a eventos
   - Registrar pagos
   - Exportar datos a Excel

## Tecnologías Utilizadas

- Node.js
- Express
- EJS (motor de plantillas)
- XLSX (exportación a Excel)
- Bootstrap 5 (interfaz de usuario)

## Contribuir

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
