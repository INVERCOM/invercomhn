'use strict'
const express = require('express')
const ModulosController =  require( '../../controllers/admin/modulos' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, ModulosController.save);
api.post('/setsts/:id',/* candado.verificaToken, */ ModulosController.setSts);
api.post('/setbullksts', candado.verificaToken, ModulosController.setBulkSts);
api.post('/getall', candado.verificaToken, ModulosController.getAll);

module.exports=api