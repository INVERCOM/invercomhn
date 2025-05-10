'use strict'
const express = require('express')
const CiasController =  require( '../../controllers/admin/companias' );
const MonedasController =  require( '../../controllers/admin/monedas' );
const ModulosController =  require( '../../controllers/admin/modulos' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, CiasController.save);
api.post('/setsts/:id', candado.verificaToken, CiasController.setSts);
api.post('/setbullksts', candado.verificaToken, CiasController.setBulkSts);
api.post('/getall', candado.verificaToken, CiasController.getAll);
api.post('/getallmonedas', candado.verificaToken, MonedasController.getAll);
api.post('/getallmodulos', candado.verificaToken, ModulosController.getAll);

api.post('/asigciasmodulos/getall/:id', candado.verificaToken, CiasController.getCiasModulos);
api.post('/asigciasmodulos/save/:id', candado.verificaToken, CiasController.saveCiasModulos);

module.exports=api