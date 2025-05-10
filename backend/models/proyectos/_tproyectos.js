// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuracion de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de compania
const _tsucursales = require('../admin/_tsucursales');

// Modelo de la tabla de proyectos/residenciales
const _tproyectos = db.define('_tproyectos', {
    proy_nid : {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del proyecto'
    },
    sucu_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tsucursales,
            key: 'sucu_nid'
          },
        comment: 'Id de la compañía'
    },
    proy_vgeopath : {
        type: Sequelize.TEXT,
        comment: 'Puntos geografico que conforman un geocerca'
    },
    proy_vnombre : {
        type: Sequelize.STRING,
        comment: 'Nombre del proyecto'
    },
    proy_vdescripcion : {
        type: Sequelize.STRING,
        comment: 'Descripción del proyecto'
    },
    proy_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado de la area del proyecto 1 -> activo, 0 -> inactivo'
    },
    
},{
    schema: 'proyectos',
    comment: 'Tabla en la que se almacenarán todos los proyectos'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tproyectos;