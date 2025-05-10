'use strict'
const express = require('express')
const AsistenciasController =  require( '../../controllers/rrhh/asistencias' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const EmpeladosController =  require( '../../controllers/rrhh/empleados' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, AsistenciasController.save);
api.post('/setsts/:id', candado.verificaToken, AsistenciasController.setSts);
api.post('/setbullksts', candado.verificaToken, AsistenciasController.setBulkSts);
api.post('/getall', candado.verificaToken, AsistenciasController.getAll);
api.post('/getlatest', candado.verificaToken, AsistenciasController.getLatest);
api.post('/getallcias', candado.verificaToken, CompaniasController.getAll);
api.post('/getallempleados', candado.verificaToken, EmpeladosController.getAll);

module.exports=api