// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de sucursales
const _tsucursales = require('../admin/_tsucursales');

// Modelo de la tabla de clientes
const _tpunto_emision = db.define('_tpunto_emision', {
    punemi_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del punto de emisión'
    },
    sucu_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tsucursales,
            key: 'sucu_nid'
          },
        comment: 'Id de la sucursal'
    },
    punemi_vcodigo : {
        type: Sequelize.STRING,
        comment: 'Código del punto de emisión'
    },
    punemi_vdescripcion : {
        type: Sequelize.STRING,
        comment: 'Descripción del punto de emisión'
    },
    punemi_vdireccion : {
        type: Sequelize.STRING,
        comment: 'Dirección del punto de emisión'
    },
    punemi_vtelefono : {
        type: Sequelize.STRING,
        comment: 'Teléfono del punto de emisión'
    },
    punemi_nconfinventario : {
        type: Sequelize.SMALLINT,
        comment: 'Configuración de la rebaja de inventario (1. Rebaja directa, 2. Con orden de entrega)'
    },
    punemi_nvalidarfactura : {
        type: Sequelize.SMALLINT,
        comment: 'Configuración para validar facturas (1. SI, 2. NO)'
    },
    punemi_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del punto de emisión'
    }
},{
    comment: 'Tabla en la cual se guardaran todos los puntos de emisión de las sucursales',
    schema: 'ventas'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tpunto_emision;