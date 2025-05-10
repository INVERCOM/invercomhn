// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Modelo de la tabla de monedas
const _tmonedas = db.define('_tmonedas', {
    mone_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id de la moneda'
    },
    mone_vnombre: {
        type: Sequelize.STRING,
        comment: 'Nombre de la moneda'
    },
    mone_vcodigo : {
        type: Sequelize.STRING,
        comment: 'Código de la moneda'
    },
    mone_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado de la moneda'
    }
},{
    comment: "Tabla en la cual se guardaran todas las monedas a utilizar",
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tmonedas;