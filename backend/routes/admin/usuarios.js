'use strict'
const express = require('express')
const UsuarioController =  require( '../../controllers/admin/usuarios' );
const CompaniasController =  require( '../../controllers/admin/companias' );
const AccesosController =  require( '../../controllers/admin/accesos' );
const EmpeladosController =  require( '../../controllers/rrhh/empleados' );
const candado = require( '../../middleware/auth' )

const api = express.Router()
api.post('/save', candado.verificaToken, UsuarioController.save);
api.post('/setsts/:id', candado.verificaToken, UsuarioController.setSts);
api.post('/setbullksts', candado.verificaToken, UsuarioController.setBulkSts);
api.post('/getall', candado.verificaToken, UsuarioController.getAll);
api.post('/changepassword/:id', candado.verificaToken, UsuarioController.changePass);

api.post('/auth/gtoken', candado.verificaToken, UsuarioController.getToken);
api.post('/auth/verifytoken', candado.verificaToken, UsuarioController.verifyToken);
api.post('/auth/login', UsuarioController.login);
api.post('/auth/changepassword', UsuarioController.changePassAuth);

api.post('/asigusuarioscias/getall/:id', candado.verificaToken, UsuarioController.getUsuariosCias);
api.post('/asigusuarioscias/save/:id', candado.verificaToken, UsuarioController.saveUsuariosCias);
api.post('/getallcias', candado.verificaToken, CompaniasController.getAll);
api.post('/getallciasbyuser', candado.verificaToken, CompaniasController.getAll);

api.post('/asigusuariosaccesos/getall/:id', candado.verificaToken, UsuarioController.getUsuariosAccesos);
api.post('/asigusuariosaccesos/save/:id', candado.verificaToken, UsuarioController.saveUsuariosAccesos);
api.post('/getallaccesos', candado.verificaToken, AccesosController.getAll);

api.post('/getallempleados', candado.verificaToken, EmpeladosController.getAll);

module.exports=api