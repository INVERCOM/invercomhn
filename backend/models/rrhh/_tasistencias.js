// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo del compañías
const _tcias = require('../admin/_tcias');
// Requerimos el modelo del empleados
const _templeados = require('./_templeados');

// Modelo de la tabla de empleados
const _tasistencias = db.define('_tasistencias', {
    asis_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id de la asistencia'
    },
    cia_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tcias,
            key: 'cia_nid'
          },
        comment: 'Id de la cia'
    },
    emp_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _templeados,
            key: 'emp_nid'
          },
        comment: 'Id del empleado'
    },
    asis_ttfechaentrada: {
        type: 'TIMESTAMP',
        comment: 'Fecha de entrada de la asistencia',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    asis_nlatentrada : {
        type: 'NUMERIC(10,8)',
        comment: 'Latitud de la entrada de la asistencia',
    },
    asis_nlongentrada : {
        type: 'NUMERIC(10,8)',
        comment: 'Longitud de la entrada de la asistencia'
    },
    asis_ttfechasalida: {
        type: 'TIMESTAMP',
        comment: 'Fecha de entrada de la asistencia'
    },
    asis_nlatsalida : {
        type: 'NUMERIC(10,8)',
        comment: 'Latitud de la entrada de la asistencia',
    },
    asis_nlongsalida : {
        type: 'NUMERIC(10,8)',
        comment: 'Longitud de la entrada de la asistencia'
    },
    asis_nminutosreceso : {
        type: Sequelize.SMALLINT,
        comment: 'Minutos los cuales se toman de receso durante la asistencia'
    },
    asis_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado de la asistencia (1 -> Pendiente, 2 -> Finalizado manualmente, 3 -> Finalizado automáticamente)'
    }
},{
    comment: "Tabla en la cual se guardaran todas la asistencias de los empleados",
    schema: "rrhh"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tasistencias;