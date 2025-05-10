// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de usuarios
const _tusuarios = require('./_tusuarios');
// Requerimos el modelo de compañías
const _tcias = require('./_tcias');

// Modelo de la tabla de asignación de usuarios compañías
const _tasig_user_cia = db.define('_tasig_user_cia', {
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
    usecia_npricipal: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        comment: 'Campo para conoce cual es la compañía principal del usuario'
    }
},{
    comment: 'Tabla para la asignación de compañías a los usuarios',
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tasig_user_cia;
