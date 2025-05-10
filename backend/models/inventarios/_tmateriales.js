// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo del compañías
const _tcias = require('../admin/_tcias');

// Modelo de la tabla de materiales
const _tmateriales = db.define('_tmateriales', {
    mater_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del material'
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
    mater_vcodigo: {
        type: Sequelize.STRING,
        comment: 'Código del material'
    },
    mater_vnombre : {
        type: Sequelize.STRING,
        comment: 'Nombre del material'
    },
    mater_vdescripcion : {
        type: Sequelize.STRING,
        comment: 'Descripción del material'
    },
    mater_vcodbar : {
        type: Sequelize.STRING,
        comment: 'Código de barras del material'
    },
    mater_nprecio : {
        type: 'NUMERIC(10,2)',
        comment: 'Precio principal del material'
    },
    mater_ncosto : {
        type: 'NUMERIC(10,2)',
        comment: 'Costo de referencia del material'
    },
    mater_ntipomanejo : {
        type: Sequelize.SMALLINT,
        comment: 'Tipo de manejo del producto (1 -> Inventariable, 2 -> No inventariable)'
    },
    mater_nisv : {
        type: Sequelize.FLOAT,
        comment: 'ISV por defecto del material en porcentaje',
        defaultValue: 0
    },
    mater_nisvincluido : {
        type: Sequelize.SMALLINT,
        comment: 'Campo para determinar si el valor del isv va incluido en el precio del material'
    },
    mater_nmostrarfact : {
        type: Sequelize.SMALLINT,
        comment: 'Mostrar el material para facturar (1 -> SI, 0 -> NO)',
        defaultValue: 1
    },
    mater_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del material'
    }
},{
    comment: 'Tabla en la cual se guardaran todos los materiales de la compañía',
    schema: 'inventarios'
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tmateriales;