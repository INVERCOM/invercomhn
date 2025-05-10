'use strict'
const express = require('express')
const MaterialesController =  require( '../../controllers/inventarios/materiales' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const ImpuestosController =  require( '../../controllers/inventarios/impuestos' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, MaterialesController.save);
api.post('/setsts/:id', candado.verificaToken, MaterialesController.setSts);
api.post('/setbullksts', candado.verificaToken, MaterialesController.setBulkSts);
api.post('/getall', candado.verificaToken, MaterialesController.getAll);

api.post('/getallcompanias', candado.verificaToken, CompaniasController.getAll);
api.post('/getallimpuestoscia', candado.verificaToken, ImpuestosController.getAll);

module.exports=api