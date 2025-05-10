'use strict'
const express = require('express')
const FormasPagosController =  require( '../../controllers/ventas/formas_pagos' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, FormasPagosController.save);
api.post('/setsts/:id', candado.verificaToken, FormasPagosController.setSts);
api.post('/setbullksts', candado.verificaToken, FormasPagosController.setBulkSts);
api.post('/getall', candado.verificaToken, FormasPagosController.getAll);

api.post('/getallcompanias', candado.verificaToken, CompaniasController.getAll);

module.exports=api