// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');
// Requerimos el modelo del compañías
const _tcias = require('../admin/_tcias');

// Modelo de la tabla de unidades de medida
const _tunidades_medidas = db.define('_tunidades_medidas', {
    unimed_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id de la unidad de medida'
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
    unimed_vdescripcion: {
        type: Sequelize.STRING,
        comment: 'Descripción de la unidad de medida'
    },
    unimed_ntipo : {
        type: Sequelize.SMALLINT,
        comment: 'Tipo de unidad de medida'
    },
    unimed_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado de la unidad de medida'
    }
},{
    comment: 'Tabla en la cual se guardaran todas las unidades de medidas',
    schema: 'inventarios'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tunidades_medidas;