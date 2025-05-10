// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de compañía
const _tcias = require('../admin/_tcias');

// Modelo de la tabla de agentes
const _tagentes = db.define('_tagentes', {
    agen_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del agente'
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
    agen_vcodigo : {
        type: Sequelize.STRING,
        comment: 'Código del agente'
    },
    agen_vnombre : {
        type: Sequelize.STRING,
        comment: 'Nombre del agente'
    },
    agen_ntipo : {
        type: Sequelize.SMALLINT,
        comment: 'Tipo de agente (1->VENTAS, 2-COBROS, 3->AMBOS)'
    },
    agen_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del agente'
    }
},{
    schema: 'ventas',
    comment: 'Tabla de agentes, en donde se almacenara el catalogo de todos los agentes'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tagentes;