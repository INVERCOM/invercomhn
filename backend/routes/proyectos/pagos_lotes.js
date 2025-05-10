'use strict'
const express = require('express')
const PagosLotesController =  require( '../../controllers/proyectos/pagos_lotes');
const SucursalesController =  require( '../../controllers/admin/sucursales');
const VentasLotesController =  require( '../../controllers/proyectos/ventas_lotes');
const MonedasController =  require( '../../controllers/admin/monedas');
const candado = require( '../../middleware/auth')

const api = express.Router()

api.post('/save', candado.verificaToken, PagosLotesController.save);
api.post('/setsts/:id', candado.verificaToken, PagosLotesController.setSts);
api.post('/getall', candado.verificaToken, PagosLotesController.getAll);
api.post('/getallbyventaslotes', candado.verificaToken, PagosLotesController.getAllByVentaLotes);
api.post('/getsaldoactualventalote', candado.verificaToken, PagosLotesController.getSaldoActualVentaLote);

api.post('/sucursales/getall', candado.verificaToken, SucursalesController.getAll);
api.post('/ventaslotes/getall', candado.verificaToken, VentasLotesController.getAllBySucursal);
api.post('/monedas/getall', candado.verificaToken, MonedasController.getAll);

module.exports=api