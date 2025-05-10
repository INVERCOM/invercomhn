'use strict'
const express = require('express')
const VentasLotesController =  require( '../../controllers/proyectos/ventas_lotes');
const ClientesController =  require( '../../controllers/ventas/clientes');
const LotesController =  require( '../../controllers/proyectos/lotes');
const candado = require( '../../middleware/auth')

const api = express.Router()

api.post('/save', candado.verificaToken, VentasLotesController.save);
api.post('/setsts/:id', candado.verificaToken, VentasLotesController.setSts);
api.post('/getall', candado.verificaToken, VentasLotesController.getAll);

api.post('/clientes/getall', candado.verificaToken, ClientesController.getAll);
api.post('/lotes/getall', candado.verificaToken, LotesController.getAll);

module.exports=api