// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de sucursales
const _tsucursales = require('./_tsucursales');
// Requerimos el modelo de usuarios
const _tusuarios = require('./_tusuarios');

// Modelo de la tabla de asignación de usuarios y accesos
const _tasig_sucursal_user = db.define('_tasig_sucursal_user', {
    sucu_nid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
            model: _tsucursales,
            key: 'sucu_nid'
          },
        comment: 'Id de la sucursal'
    },
    user_nid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
            model: _tusuarios,
            key: 'user_nid'
          },
        comment: 'Id del usuario'
    }
},{
    comment: 'Tabla para la asignación de sucursales a usuarios',
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tasig_sucursal_user;
