'use strict'
const express = require('express')
const AgentesController =  require( '../../controllers/ventas/agentes' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, AgentesController.save);
api.post('/setsts/:id', candado.verificaToken, AgentesController.setSts);
api.post('/setbullksts', candado.verificaToken, AgentesController.setBulkSts);
api.post('/getall', candado.verificaToken, AgentesController.getAll);

api.post('/getallcompanias', candado.verificaToken, CompaniasController.getAll);

module.exports=api