// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');
// Requerimos el modelo del compañías
const _tcias = require('../admin/_tcias');

// Modelo de la tabla de documentos fiscales
const _tdocumentos_fiscales = db.define('_tdocumentos_fiscales', {
    docfis_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del documento fiscal'
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
    docfis_vcodigo: {
        type: Sequelize.STRING,
        comment: 'Codigo del documento fiscal'
    },
    docfis_vdescripcion: {
        type: Sequelize.STRING,
        comment: 'Descripción del documento fiscal'
    },
    docfis_nrebajarinventarios : {
        type: Sequelize.SMALLINT,
        comment: 'Configuracion para saber si el documento genera movimientos de inventario (1->SI, 0->No)'
    },
    docfis_ngenerarcxc : {
        type: Sequelize.SMALLINT,
        comment: 'Configuracion para saber si el documento genera movimientos de cuentas por cobrar (1->SI, 0->No)'
    },
    docfis_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del documento fiscal'
    }
},{
    comment: 'Tabla en la cual se guardaran todas los documentos fiscales',
    schema: 'ventas'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tdocumentos_fiscales;