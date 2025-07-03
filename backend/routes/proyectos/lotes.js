'use strict'
const express = require('express')
const Lotes =  require( '../../controllers/proyectos/lotes');
const candado = require( '../../middleware/auth' )

const api = express.Router()

api.post('/save', candado.verificaToken, Lotes.createLote);
api.post('/setsts/:id', candado.verificaToken, Lotes.setSts);
api.post('/getall', Lotes.getAll);
api.post('/getimg', Lotes.getImg);

module.exports=api