// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Modelo de la tabla de materiales
const _timpuestos = db.define('_timpuestos', {
    isv_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del impuesto'
    },
    isv_vdescripcion: {
        type: Sequelize.STRING,
        comment: 'Descripción del impuesto'
    },
    isv_nvalor : {
        type: 'NUMERIC(10,2)',
        comment: 'Valor del impuesto de 0 a 100',
        unique: {
            args: true,
            msg: 'unique_value_isv_error'
        }
    },
    isv_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del impuesto'
    }
},{
    comment: 'Tabla en la cual se guardaran todos los impuestos manejables en el sistema',
    schema: 'inventarios'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _timpuestos;