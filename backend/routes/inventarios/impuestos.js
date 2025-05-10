'use strict'
const express = require('express')
const ImpuestosController =  require( '../../controllers/inventarios/impuestos' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, ImpuestosController.save);
api.post('/setsts/:id', candado.verificaToken, ImpuestosController.setSts);
api.post('/setbullksts', candado.verificaToken, ImpuestosController.setBulkSts);
api.post('/getall', candado.verificaToken, ImpuestosController.getAll);

module.exports=api