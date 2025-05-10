'use strict'
const express = require('express')
const RegistrosFiscalesController =  require( '../../controllers/ventas/registros_fiscales' );
const PuntosEmisionController =  require( '../../controllers/ventas/puntos_emision' );
const DocumentosFiscalesController =  require( '../../controllers/ventas/documentos_fiscales' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, RegistrosFiscalesController.save);
api.post('/setsts/:id', candado.verificaToken, RegistrosFiscalesController.setSts);
api.post('/setbullksts', candado.verificaToken, RegistrosFiscalesController.setBulkSts);
api.post('/getall', candado.verificaToken, RegistrosFiscalesController.getAll);

api.post('/getallpuntosemision', candado.verificaToken, PuntosEmisionController.getAll);
api.post('/getalldocumentosfiscales', candado.verificaToken, DocumentosFiscalesController.getAll);

module.exports=api