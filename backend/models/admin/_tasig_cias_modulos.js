// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de compañías
const _tcias = require('./_tcias');
// Requerimos el modelo de módulos
const _tmodulos = require('./_tmodulos');

// Modelo de la tabla de asignación de compañías y módulos
const _tasig_cias_modulos = db.define('_tasig_cias_modulos', {
    cia_nid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
            model: _tcias,
            key: 'cia_nid'
          },
        comment: 'Id de la compañía'
    },
    modu_nid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
            model: _tmodulos,
            key: 'modu_nid'
          },
        comment: 'Id del modulo'
    }
},{
    comment: 'Tabla para la asignación de compañías y módulos',
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tasig_cias_modulos;
