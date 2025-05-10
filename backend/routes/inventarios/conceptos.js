'use strict'
const express = require('express')
const ConceptosInvController =  require( '../../controllers/inventarios/conceptos' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, ConceptosInvController.save);
api.post('/setsts/:id', candado.verificaToken, ConceptosInvController.setSts);
api.post('/setbullksts', candado.verificaToken, ConceptosInvController.setBulkSts);
api.post('/getall', candado.verificaToken, ConceptosInvController.getAll);

api.post('/getallcompanias', candado.verificaToken, CompaniasController.getAll);

module.exports=api