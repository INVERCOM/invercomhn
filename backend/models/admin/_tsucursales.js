// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo del compañías
const _tcias = require('./_tcias');

// Modelo de la tabla de sucursales
const _tsucursales = db.define('_tsucursales', {
    sucu_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id de la sucursal'
    },
    cia_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tcias,
            key: 'cia_nid'
          },
        comment: 'Id de la compañía'
    },
    sucu_vcodigo: {
        type: Sequelize.STRING,
        comment: 'Código de la sucursal'
    },
    sucu_vnombre : {
        type: Sequelize.STRING,
        comment: 'Nombre de la sucursal'
    },
    sucu_vdireccion : {
        type: Sequelize.STRING,
        comment: 'Dirección de la sucursal'
    },
    sucu_vtelefono : {
        type: Sequelize.STRING,
        comment: 'Teléfono de la sucursal'
    },
    sucu_vcorreo : {
        type: Sequelize.STRING,
        comment: 'Correo electrónico de la sucursal'
    },
    sucu_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado de la sucursal'
    }
},{
    comment: "Tabla en la cual se guardaran todas las sucursales a utilizar",
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tsucursales;