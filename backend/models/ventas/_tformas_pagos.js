// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de compañía
const _tcias = require('../admin/_tcias');

// Modelo de la tabla de formas de pagos
const _tformas_pagos = db.define('_tformas_pagos', {
    forpag_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id de la forma de pago'
    },
    cia_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tcias,
            key: 'cia_nid'
          },
        comment: 'Id de la compañía'
    },
    forpag_vcodigo : {
        type: Sequelize.STRING,
        comment: 'Código de la forma de pago'
    },
    forpag_vdescripcion : {
        type: Sequelize.STRING,
        comment: 'Descripción de la forma de pago'
    },
    forpag_ndprocentajeadicional : {
        type: Sequelize.FLOAT,
        comment: 'Porcentaje de cobro adicional (0 - 100)'
    },
    forpag_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado de la forma de pago'
    }
},{
    schema: 'ventas',
    comment: 'Tabla de formas de pago, en donde se almacenara el catalogo de todas las formas de pago'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tformas_pagos;