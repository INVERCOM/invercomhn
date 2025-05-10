'use strict'
const express = require('express')
const PuntosEmisionController =  require( '../../controllers/ventas/puntos_emision' );
const SucursalesController =  require( '../../controllers/admin/sucursales' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, PuntosEmisionController.save);
api.post('/setsts/:id', candado.verificaToken, PuntosEmisionController.setSts);
api.post('/setbullksts', candado.verificaToken, PuntosEmisionController.setBulkSts);
api.post('/getall', candado.verificaToken, PuntosEmisionController.getAll);

api.post('/getallsucursales', candado.verificaToken, SucursalesController.getAll);

module.exports=api