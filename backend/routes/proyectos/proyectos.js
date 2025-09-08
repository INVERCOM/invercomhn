'use strict'
const express = require('express')
const Proyectos =  require( '../../controllers/proyectos/proyectos');
const candado = require( '../../middleware/auth')

const api = express.Router()

api.post('/save', candado.verificaToken, Proyectos.createProyecto);
api.post('/setsts/:id', candado.verificaToken, Proyectos.setSts);
api.post('/getall', candado.verificaToken, Proyectos.getAll);
api.post('/getallforclients', Proyectos.getAllForClients);
api.post('/getimg', Proyectos.getImg);

module.exports=api