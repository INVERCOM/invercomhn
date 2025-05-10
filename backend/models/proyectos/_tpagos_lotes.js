// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuracion de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelos foraneos
const _tsucursales = require('../admin/_tsucursales');
const _tventas_lotes = require('./_tventas_lotes');
const _tmonedas = require('../admin/_tmonedas');

// Modelo de la tabla de pagos de ventas de lotes
const _tpagos_lotes = db.define('_tpagos_lotes', {
    paglot_nid : {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del pago del lote'
    },
    sucu_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tsucursales,
            key: 'sucu_nid'
          },
        comment: 'Id de la sucursal para la que es el pago'
    },
    venlot_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tventas_lotes,
            key: 'venlot_nid'
          },
        comment: 'Id de la venta de lote a la cual se le hara el pago'
    },
    mone_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tmonedas,
            key: 'mone_nid'
          },
        comment: 'Id de la moneda del pago'
    },
    paglot_vnumerodocumento : {
        type: Sequelize.STRING,
        comment: 'Numero de documento del pago lote final del 8 digitos'
    },
    paglot_nnumerodocumento : {
        type: Sequelize.STRING,
        comment: 'Numero de documento del pago lote secuencial'
    },
    paglot_dfecha : {
        type: Sequelize.DATEONLY,
        comment: 'Fecha en la cual se registra el pago'
    },
    paglot_ttfechacreacion : {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha en la que se creo el pago'
    },
    paglot_fimporte : {
        type: 'NUMERIC(10,2)',
        comment: 'Importe que se pago del lote'
    },
    paglot_ffactorcambio : {
        type: 'NUMERIC(10,2)',
        comment: 'Factor de cambio entre las monedas'
    },
    paglot_fimportelocal : {
        type: 'NUMERIC(10,2)',
        comment: 'Importe que se esta pagando en moneda local'
    },
    paglot_vdocumentoreferecnia : {
        type: Sequelize.STRING,
        comment: 'Documento de referencia del pago del lote'
    },
    paglot_vobservaciones : {
        type: Sequelize.STRING,
        comment: 'Observaciones del pago al lote'
    },
    paglot_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del pago del lote 1 -> activo, 0 -> inactivo'
    },    
},{
    schema: 'proyectos',
    comment: 'Tabla en la que se almacenarán todos los pago hechos a las ventas de los lotes'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tpagos_lotes;