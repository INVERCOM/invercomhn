// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de compañía
const _tcias = require('../admin/_tcias');

// Modelo de la tabla de conceptos de inventario
const _tconceptos_inventarios = db.define('_tconceptos_inventarios', {
    coninv_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del concepto inventario'
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
    coninv_vdescripcion : {
        type: Sequelize.STRING,
        comment: 'Descripción del concepto inventario'
    },
    coninv_vobservaciones: {
        type: Sequelize.TEXT,
        comment: 'Observaciones del concepto de inventario'
    },
    coninv_ntipo : {
        type: Sequelize.SMALLINT,
        comment: 'Tipo de concepto de inventario (1 -> ENTRADA, 2 -> SALIDA, 3 -> TRANSFERENCIA)'
    },
    coninv_nbodegaconfigurada: {
        type: Sequelize.SMALLINT,
        comment: 'Configuracion de bodega por defecto 0 -> NO, 1 -> BODEGA PRINCIPAL, 2 -> BODEGA DEVOLUCIONES'
    },
    coninv_nisvencosteo: {
        type: Sequelize.SMALLINT,
        comment: 'Campo que determina si el costo del producto es con el impuesto o si este (1 -> SI, 0 -> NO)',
        default: 0
    },
    coninv_ndevolucion: {
        type: Sequelize.SMALLINT,
        comment: 'Campo que determina si el concepto sera usado para devoluciones (1 -> SI, 0 -> NO)',
        default: 0
    },
    coninv_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del concepto de inventario'
    }
},{
    comment: 'Tabla de conceptos inventario, en donde se lleva la gestion de todos los conceptos del modulo de inventario',
    schema: 'inventarios'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tconceptos_inventarios;