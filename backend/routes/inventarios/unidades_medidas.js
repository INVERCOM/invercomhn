'use strict'
const express = require('express')
const UnidadesMedidasController =  require( '../../controllers/inventarios/unidades_medidas' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, UnidadesMedidasController.save);
api.post('/setsts/:id', candado.verificaToken, UnidadesMedidasController.setSts);
api.post('/setbullksts', candado.verificaToken, UnidadesMedidasController.setBulkSts);
api.post('/getall', candado.verificaToken, UnidadesMedidasController.getAll);

api.post('/getallcompanias', candado.verificaToken, CompaniasController.getAll);

module.exports=api