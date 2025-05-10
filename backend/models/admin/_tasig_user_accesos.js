// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de usuarios
const _tusuarios = require('./_tusuarios');
// Requerimos el modelo de accesos
const _taccesos = require('./_taccesos');

// Modelo de la tabla de asignación de usuarios y accesos
const _tasig_user_accesos = db.define('_tasig_user_accesos', {
    user_nid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
            model: _tusuarios,
            key: 'user_nid'
          },
        comment: 'Id del usuario'
    },
    acce_nid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
            model: _taccesos,
            key: 'acce_nid'
          },
        comment: 'Id del acceso'
    }
},{
    comment: 'Tabla para la asignación de usuarios y accesos',
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tasig_user_accesos;
