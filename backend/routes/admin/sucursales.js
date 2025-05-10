'use strict'
const express = require('express')
const SucursalesController =  require( '../../controllers/admin/sucursales' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const UsuariosController =  require( '../../controllers/admin/usuarios' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, SucursalesController.save);
api.post('/setsts/:id', candado.verificaToken, SucursalesController.setSts);
api.post('/setbullksts', candado.verificaToken, SucursalesController.setBulkSts);
api.post('/getall', candado.verificaToken, SucursalesController.getAll);

api.post('/getallcompanias', candado.verificaToken, CompaniasController.getAll);

api.post('/asigsucursalusuarios/getall/:id', candado.verificaToken, SucursalesController.getSucursalUsuarios);
api.post('/asigsucursalusuarios/save/:id', candado.verificaToken, SucursalesController.saveSucursalUsuarios);
api.post('/getallusuariosbycia', candado.verificaToken, UsuariosController.getAllByCia);

module.exports=api