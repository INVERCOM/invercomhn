// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo del compañías
const _tcias = require('../admin/_tcias');

// Modelo de la tabla de clientes
const _tclientes = db.define('_tclientes', {
    cli_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del cliente'
    },
    cia_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tcias,
            key: 'cia_nid'
          },
        comment: 'Id de la cia'
    },
    cli_vnombre: {
        type: Sequelize.STRING,
        comment: 'Nombre del cliente'
    },
    cli_videntidad : {
        type: Sequelize.STRING,
        comment: 'identidad del cliente'
    },
    cli_vrtn : {
        type: Sequelize.STRING,
        comment: 'RTN del cliente'
    },
    cli_vdireccion : {
        type: Sequelize.STRING,
        comment: 'Dirección del cliente'
    },
    cli_vtelefono : {
        type: Sequelize.STRING,
        comment: 'Teléfono del cliente'
    },
    cli_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del cliente'
    }
},{
    comment: 'Tabla en la cual se guardaran todos los clientes de la compañía',
    schema: 'ventas'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tclientes;