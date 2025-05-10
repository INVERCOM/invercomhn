// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo del módulo
const _tmodulos = require('./_tmodulos');

// Modelo de la tabla de accesos
const _taccesos = db.define('_taccesos', {
    acce_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del acceso'
    },
    modu_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tmodulos,
            key: 'modu_nid'
          },
        comment: 'Id del módulo'
    },
    acce_vnombre: {
        type: Sequelize.STRING,
        comment: 'Nombre del acceso'
    },
    acce_vdescripcion : {
        type: Sequelize.STRING,
        comment: 'Descripción del acceso'
    },
    acce_vclave : {
        type: Sequelize.STRING,
        comment: 'Clave única del acceso'
    },
    acce_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del acceso'
    }
},{
    comment: "Tabla en la cual se guardaran todas los accesos a utilizar",
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _taccesos;