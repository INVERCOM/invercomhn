// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo de las monedas
const _tmonedas = require('./_tmonedas');

// Modelo de la tabla de compañías
const _tcias = db.define('_tcias', {
    cia_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id de la compañía'
    },
    cia_vnombre: {
        type: Sequelize.STRING,
        comment: 'Nombre de la compañía',
    },
    cia_vnombrecomercial: {
        type: Sequelize.STRING,
        comment: 'Nombre comercial de la compañía',
    },
    cia_vdireccion : {
        type: Sequelize.STRING,
        comment: 'Dirección de la compañía'
    },
    cia_vtelefono : {
        type: Sequelize.STRING,
        comment: 'Teléfono de la compañía'
    },
    cia_vrtn : {
        type: Sequelize.STRING,
        comment: 'RTN de la compañía'
    },
    cia_vcorreo : {
        type: Sequelize.STRING,
        comment: 'Correo de la compañía'
    },
    mone_nid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
            model: _tmonedas,
            key: 'mone_nid'
          },
        comment: 'Id de la moneda que tendrá por defecto la compañía'
    },
    cia_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado de la compañía'
    }
},{
    comment: "Tabla en la cual se guardaran todos las compañías",
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tcias;