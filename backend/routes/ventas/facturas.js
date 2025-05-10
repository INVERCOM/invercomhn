'use strict'
const express = require('express')
const ClientesController =  require( '../../controllers/ventas/clientes' );
const AgentesController =  require( '../../controllers/ventas/agentes' );
const PuntosEmisionController =  require( '../../controllers/ventas/puntos_emision' );
const RegistrosFiscalesController =  require( '../../controllers/ventas/registros_fiscales' );
const MonedasController =  require( '../../controllers/admin/monedas' );
const FormasPagosController =  require( '../../controllers/ventas/formas_pagos' );
const MaterialesController =  require( '../../controllers/inventarios/materiales' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, ClientesController.save);
api.post('/setsts/:id', candado.verificaToken, ClientesController.setSts);
api.post('/setbullksts', candado.verificaToken, ClientesController.setBulkSts);
api.post('/getall', candado.verificaToken, ClientesController.getAll);
api.post('/getallpuntosemision', candado.verificaToken, PuntosEmisionController.getAll);
api.post('/getallclientes', candado.verificaToken, ClientesController.getAll);
api.post('/getallagentes', candado.verificaToken, AgentesController.getAll);
api.post('/getallregistrosfiscalesbypuntoemision', candado.verificaToken, RegistrosFiscalesController.getAllByPuntoEmision);
api.post('/getallmonedas', candado.verificaToken, MonedasController.getAll);
api.post('/getallformaspagos', candado.verificaToken, FormasPagosController.getAll);
api.post('/getallmateriales', candado.verificaToken, MaterialesController.getAll);

module.exports=api