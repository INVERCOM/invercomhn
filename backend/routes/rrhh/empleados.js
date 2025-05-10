'use strict'
const express = require('express')
const EmpleadosController =  require( '../../controllers/rrhh/empleados' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, EmpleadosController.save);
api.post('/setsts/:id', candado.verificaToken, EmpleadosController.setSts);
api.post('/setbullksts', candado.verificaToken, EmpleadosController.setBulkSts);
api.post('/getall', candado.verificaToken, EmpleadosController.getAll);
api.post('/getallcompanias', candado.verificaToken, CompaniasController.getAll);

module.exports=api