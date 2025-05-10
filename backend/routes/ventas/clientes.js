'use strict'
const express = require('express')
const ClientesController =  require( '../../controllers/ventas/clientes' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, ClientesController.save);
api.post('/setsts/:id', candado.verificaToken, ClientesController.setSts);
api.post('/setbullksts', candado.verificaToken, ClientesController.setBulkSts);
api.post('/getall', candado.verificaToken, ClientesController.getAll);
api.post('/getallcompanias', candado.verificaToken, CompaniasController.getAll);

module.exports=api