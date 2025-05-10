// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Modelo de la tabla de módulos
const _tmodulos = db.define('_tmodulos', {
    modu_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del modulo'
    },
    modu_vnombre: {
        type: Sequelize.STRING,
        comment: 'Nombre del modulo'
    },
    modu_vdescripcion : {
        type: Sequelize.STRING,
        comment: 'Descripción del modulo'
    },
    modu_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del modulo'
    }
},{
    comment: "Tabla en la cual se guardaran todas los módulos a utilizar",
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tmodulos;