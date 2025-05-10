// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuracion de la base de datos
const db = require('../../db/conexion');

const _tfacturas = require('./_tfacturas');
const _tmateriales = require('../inventarios/_tmateriales');

// Modelo de la tabla de registros de autorizaciones fiscales
const _tfacturas_detalle = db.define('_tfacturas_detalle', {
    facdet_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del detalle de factura'
    },
    fact_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tfacturas,
            key: 'fact_nid'
          },
        comment: 'Id de factura'
    },
    mater_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tmateriales,
            key: 'mater_nid'
          },
        comment: 'Id de la lista de precio del material'
    },
    facdet_fcantidad : {
        type: Sequelize.FLOAT,
        comment: 'Cantidad facturada del detalle',
        defaultValue: 0
    },
    facdet_fcosto : {
        type: Sequelize.FLOAT,
        comment: 'Costo facturada del detalle',
        defaultValue: 0
    },
    facdet_fdescuentosaplicados : {
        type: Sequelize.FLOAT,
        comment: 'Descuento aplicado al item facturada del detalle en porcentaje',
        defaultValue: 0
    },
    facdet_fdescuentovalor : {
        type: Sequelize.FLOAT,
        comment: 'Descuento aplicado al item facturada del detalle en valor',
        defaultValue: 0
    },
    facdet_fimpuestosaplicados : {
        type: Sequelize.FLOAT,
        comment: 'Impuestos aplicados al detalle',
        defaultValue: 0
    },
    facdet_fimpuestosvalor : {
        type: Sequelize.FLOAT,
        comment: 'Impuesto total del detalle',
        defaultValue: 0
    },
    facdet_fsubtotal : {
        type: Sequelize.FLOAT,
        comment: 'Subtotal del detalle de la factura',
        defaultValue: 0
    },
    facdet_vdescripcion : {
        type: Sequelize.STRING,
        comment: 'Descripción del detalle de factura'
    }
},{
    schema: 'ventas',
    comment: 'Tabla de detalles de factura, en donde se almacenara todos los facturas'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tfacturas_detalle;