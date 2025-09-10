// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');
// Requerimos el modelo del lote
const _tlotes = require('./_tlotes');
// Requerimos el modelo del cliente
const _tclientes = require('../ventas/_tclientes');

// Modelo de la tabla de ventas de lotes
const _tventas_lotes = db.define('_tventas_lotes', {
    venlot_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id de la venta del lote'
    },
    lote_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tlotes,
            key: 'lote_nid'
          },
        comment: 'Id del lote'
    },
    cli_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tclientes,
            key: 'cli_nid'
          },
        comment: 'Id del cliente'
    },
    venlot_dfecha: {
        type: Sequelize.DATEONLY,
        comment: 'Fecha de la venta',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    venlot_fprecio: {
        type: 'NUMERIC(10,2)',
        comment: 'Precio de venta del lote',
    },
    venlot_fprima: {
        type: 'NUMERIC(10,2)',
        comment: 'Prima de la venta del lote',
    },
    venlot_fvalorfinal: {
        type: 'NUMERIC(10,2)',
        comment: 'Valor final de la venta del lote',
    },
    venlot_ftasainteresanual: {
        type: 'NUMERIC(10,2)',
        comment: 'Porcentage de interes la venta del lote',
    },
    venlot_nnumeromeses: {
        type: Sequelize.INTEGER,
        comment: 'Numero de meses en el cual se va realizar el pago de la venta',
    },
    venlot_ndiapago: {
        type: Sequelize.SMALLINT,
        comment: 'Dia del mes que se genera el pago',
    },
    venlot_ndiamaxpago: {
        type: Sequelize.SMALLINT,
        comment: 'Dia maximo que se puede efectuar el pago',
    },
    venlot_fcuotanivelada: {
        type: 'NUMERIC(10,2)',
        comment: 'Cuota que debe de pagar el cliente por la venta',
    },
    venlot_dfechaprimerpago: {
        type: Sequelize.DATEONLY,
        comment: 'Fecha del primer pago'
    },
    venlot_vobservaciones: {
        type: Sequelize.TEXT,
        comment: 'Observaciones de la venta del lote',
    },
    venlot_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado de la venta del lote'
    }
},{
    schema: 'proyectos',
    comment: 'Tabla en la cual se guardaran todas los lotes que se vendan',
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tventas_lotes;