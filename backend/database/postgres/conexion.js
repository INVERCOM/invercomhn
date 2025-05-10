const Sequelize = require('sequelize');

const hostDB = process.env.DATABASE_HOST; // Host en donde esta alojado la base de datos
const portDB = process.env.DATABASE_PORT; // Puerto en donde esta alojado la base de datos

const dbname = process.env.DATABASE_NAME; // Nombre de la base de datos
const dbusername = process.env.DATABASE_USER;; // Nombre del usuario para la plataforma
const dbuserpassword = process.env.DATABASE_PASSWORD; // Contraseña del usuario de la plataformacl
const db = new Sequelize(`${dbname}`, dbusername, dbuserpassword, {
  host: hostDB,
  port: portDB,
  dialect: 'postgres',
  logging: false, // console.log, // Desactiva los mensajes en la consola
  operatorsAliases : 0,
  define: {
    timestamps : false,
    freezeTableName: true
  },
  pool: {
    max: 100,
    min: 0,
    acquire: 60000,
    idle: 10000
  }
});

module.exports = db;