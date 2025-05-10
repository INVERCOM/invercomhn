// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuracion de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de proyectos y unimeds
const _tproyectos = require('./_tproyectos');
const _tunidades_medidas = require('../inventarios/_tunidades_medidas');

// Modelo de la tabla de lotes
const _tlotes = db.define('_tlotes', {
    lote_nid : {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del lote'
    },
    proy_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tproyectos,
            key: 'proy_nid'
          },
        comment: 'Id del proyecto (residencial) al que pertenece el lote'
    },
    unimed_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tunidades_medidas,
            key: 'unimed_nid'
          },
        comment: 'Id de la unidad de medida'
    },
    lote_vgeopath : {
        type: Sequelize.TEXT,
        comment: 'Puntos geografico que conforman un geocerca'
    },
    lote_vcodigo : {
        type: Sequelize.STRING,
        comment: 'Código del lote'
    },
    lote_vnombre : {
        type: Sequelize.STRING,
        comment: 'Nombre del lote'
    },
    lote_fmedida: {
        type: Sequelize.FLOAT,
        comment: 'medidas del lote'
    },
    lote_flargo : {
        type: Sequelize.FLOAT,
        comment: 'Largo del lote'
    },
    lote_fancho : {
        type: Sequelize.FLOAT,
        comment: 'Ancho del lote'
    },
    lote_fprecio_unidad : {
        type: Sequelize.FLOAT,
        comment: 'Precio del lote por unidad'
    },
    lote_fprecio : {
        type: Sequelize.FLOAT,
        comment: 'Precio del lote'
    },
    lote_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del lote 1 -> activo, 0 -> inactivo'
    },    
},{
    schema: 'proyectos',
    comment: 'Tabla en la que se almacenarán todos los lotes de los lotes'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tlotes;