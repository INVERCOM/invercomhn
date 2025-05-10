// Requerimos el modulo de Sequelize
const Sequelize = require('sequelize');

// Requerimos el archivo de configuración de la base de datos
const db = require('../../database/postgres/conexion');

// Modelo de la tabla del usuarios
const _tusuarios = db.define('_tusuarios', {
    user_nid :{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement : true,
        comment: 'Id del usuario'
    },
    user_vmail: {
        type: Sequelize.STRING,
        comment: 'Correo electrónico de usuario',
        unique: {
            args: true,
            msg: 'unique_user_vmail_error'
        }
    },
    user_vtelefono : {
        type: Sequelize.STRING,
        comment: 'Código de la moneda'
    },
    user_vpass : {
        type: Sequelize.STRING,
        comment: 'Contraseña del usuario'
    },
    user_vtiemposesion : {
        type: Sequelize.STRING,
        comment: 'Contraseña del usuario',
        default:'1h'
    },
    emp_nid: {
        type: Sequelize.BIGINT,
        comment: 'Id del empleado al cual pertenece el usuario',
        default: 0
    },
    user_nsts : {
        type: Sequelize.SMALLINT,
        comment: 'Estado del usuario (1 -> Activo, 2 -> Pendiente, 0 -> Inactivo)'
    }
},{
    comment: "Tabla en la cual se guardaran todos los usuarios",
    schema: "admin"
});

// Exportamos el modelo para que pueda ser usado en otras instancias del proyecto
module.exports = _tusuarios;