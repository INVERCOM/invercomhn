'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const morgan = require('morgan');

// Middlewares
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, './www')));

// Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

const image_route = require('./routes/images/images')
app.use('/api/imgs', image_route);

// Rutas
app.get('*', (req, res, next) => {
	if (req.accepts('html')) {
		res.sendFile(path.join(__dirname, './www', 'index.html'))
	} else {
		next()
	}
});

// Rutas

// ======================= ADMIN ==============================
const usuarios_routes = require('./routes/admin/usuarios');
const companias_routes = require('./routes/admin/companias');
const sucursales_routes = require('./routes/admin/sucursales');
const modulos_routes = require('./routes/admin/modulos');
const accesos_routes = require('./routes/admin/accesos');

app.use('/api/users', usuarios_routes);
app.use('/api/usuarios', usuarios_routes);
app.use('/api/companias', companias_routes);
app.use('/api/sucursales', sucursales_routes);
app.use('/api/modulos', modulos_routes);
app.use('/api/accesos', accesos_routes);

// ======================= RRHH ==============================

const empleados_routes = require('./routes/rrhh/empleados');
const asistencias_routes = require('./routes/rrhh/asistencias');

app.use('/api/empleados', empleados_routes);
app.use('/api/asistencias', asistencias_routes);

// ======================= PROYECTOS ==============================

const proyetos_routes = require('./routes/proyectos/proyectos');
const lotes_routes = require('./routes/proyectos/lotes');
const ventas_lotes_routes = require('./routes/proyectos/ventas_lotes');
const pagos_lotes_routes = require('./routes/proyectos/pagos_lotes');

app.use('/api/proyectos', proyetos_routes);
app.use('/api/lotes', lotes_routes);
app.use('/api/ventaslotes', ventas_lotes_routes);
app.use('/api/pagoslotes', pagos_lotes_routes);

// ===================== INVENTARIOS ==========================

const materiales_routes = require('./routes/inventarios/materiales');
const conceptos_inventarios_routes = require('./routes/inventarios/conceptos');
const impuestos_routes = require('./routes/inventarios/impuestos');
const unidades_medidas_routes = require('./routes/inventarios/unidades_medidas');

app.use('/api/materiales', materiales_routes);
app.use('/api/conceptosinventarios', conceptos_inventarios_routes);
app.use('/api/impuestos', impuestos_routes);
app.use('/api/unidadesmedidas', unidades_medidas_routes);

// ======================= VENTAS ==============================

const facturas_routes = require('./routes/ventas/facturas');
const clientes_routes = require('./routes/ventas/clientes');
const puntos_emision_routes = require('./routes/ventas/puntos_emision');
const documentos_fiscales_routes = require('./routes/ventas/documentos_fiscales');
const registros_fiscales_routes = require('./routes/ventas/registros_fiscales');
const formas_pagos_routes = require('./routes/ventas/formas_pagos');
const agentes_routes = require('./routes/ventas/agentes');

app.use('/api/facturas', facturas_routes);
app.use('/api/clientes', clientes_routes);
app.use('/api/puntosemision', puntos_emision_routes);
app.use('/api/documentosfiscales', documentos_fiscales_routes);
app.use('/api/registrosfiscales', registros_fiscales_routes);
app.use('/api/formaspagos', formas_pagos_routes);
app.use('/api/agentes', agentes_routes);


//=============================================SHARED===================================================


module.exports = app