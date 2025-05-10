// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Requerimos el modelo del compañías
const _tcias = require('../admin/_tcias');

// Modelo de la tabla de empleados
const _templeados = db.define('_templeados', {
    emp_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del empleado'
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
    emp_vcodigo: {
        type: Sequelize.STRING,
        comment: 'Código del empleado'
    },
    emp_videntidad : {
        type: Sequelize.STRING,
        comment: 'identidad del empleado'
    },
    emp_vnombre : {
        type: Sequelize.STRING,
        comment: 'Nombre del empleado'
    },
    emp_vapellido : {
        type: Sequelize.STRING,
        comment: 'Apellido del empleado'
    },
    emp_vdireccion : {
        type: Sequelize.STRING,
        comment: 'Dirección del empleado'
    },
    emp_vtelefono : {
        type: Sequelize.STRING,
        comment: 'Teléfono del empleado'
    },
    emp_vfechaingreso : {
        type: Sequelize.DATEONLY,
        comment: 'Fecha en la cual ingreso el empleado'
    },
    emp_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del empleado'
    }
},{
    comment: "Tabla en la cual se guardaran todos los empleado de la compañía",
    schema: "rrhh"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _templeados;