'use strict'
const express = require('express')
const AccesosController =  require( '../../controllers/admin/accesos' );
const ModulosController =  require( '../../controllers/admin/modulos' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, AccesosController.save);
api.post('/setsts/:id', candado.verificaToken, AccesosController.setSts);
api.post('/setbullksts', candado.verificaToken, AccesosController.setBulkSts);
api.post('/getall', candado.verificaToken, AccesosController.getAll);

api.post('/getallmodulos', candado.verificaToken, ModulosController.getAll);

module.exports=api