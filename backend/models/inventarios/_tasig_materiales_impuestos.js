// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de compañías
const _tmateriales = require('./_tmateriales');
// Requerimos el modelo de usuarios
const _timpuestos = require('./_timpuestos');

// Modelo de la tabla de asignación de materiales e impuestos
const _tasig_materiales_impuestos = db.define('_tasig_materiales_impuestos', {
    mater_nid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
            model: _tmateriales,
            key: 'mater_nid'
          },
        comment: 'Id del material'
    },
    isv_nid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
            model: _timpuestos,
            key: 'isv_nid'
          },
        comment: 'Id del impuestos'
    }
},{
    comment: 'Tabla para la asignación de materiales e impuestos',
    schema: "inventarios"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tasig_materiales_impuestos;
