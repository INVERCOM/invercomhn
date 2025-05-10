// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de puntos de emision
const _tpuntos_emision = require('../ventas/_tpuntos_emision');
// Requerimos el modelo de documnetos fiscales
const _tdocumentos_fiscales = require('../ventas/_tdocumentos_fiscales');

// Modelo de la tabla de registros fiscales
const _tregistros_fiscales = db.define('_tregistros_fiscales', {
    regfis_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del registro fiscal'
    },
    punemi_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tpuntos_emision,
            key: 'punemi_nid'
          },
        comment: 'Id del punto de emision'
    },
    docfis_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tdocumentos_fiscales,
            key: 'docfis_nid'
          },
        comment: 'Id del documento fiscal'
    },
    regfis_vcai : {
        type: Sequelize.TEXT,
        comment: 'CAI del registro fiscal'
    },
    regfis_vnumeroautorizacion : {
        type: Sequelize.TEXT,
        comment: 'Numero de autorizacion del registro fiscal'
    },
    regfis_ninicio : {
        type: Sequelize.BIGINT,
        comment: 'Numero de inicio de registro fiscal'
    },
    regfis_nfin : {
        type: Sequelize.BIGINT,
        comment: 'Numero final de registro fiscal'
    },
    regfis_dfechamaxemision : {
        type: Sequelize.DATEONLY,
        comment: 'Fecha maxima de expiracion del registro fiscal'
    },
    regfis_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del registro fiscal'
    }
},{
    comment: 'Tabla en la cual se guardaran todos los registros fiscales',
    schema: 'ventas'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tregistros_fiscales;