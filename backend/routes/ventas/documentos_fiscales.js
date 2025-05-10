'use strict'
const express = require('express')
const DocumentosFiscalesController =  require( '../../controllers/ventas/documentos_fiscales' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, DocumentosFiscalesController.save);
api.post('/setsts/:id', candado.verificaToken, DocumentosFiscalesController.setSts);
api.post('/setbullksts', candado.verificaToken, DocumentosFiscalesController.setBulkSts);
api.post('/getall', candado.verificaToken, DocumentosFiscalesController.getAll);

api.post('/getallcompanias', candado.verificaToken, CompaniasController.getAll);

module.exports=api