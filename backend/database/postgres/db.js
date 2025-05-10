// Requerimos el ORM "Sequelize"
const Sequelize = require('sequelize');

const hostDB = process.env.DATABASE_HOST; // Host en donde esta alojado la base de datos
const portDB = process.env.DATABASE_PORT; // Puerto en donde esta alojado la base de datos

const superdbusername = process.env.SUPER_USER_DATABASE_NAME; // Nombre del super usuario de postgres
const superdbuserpassword = process.env.SUPER_USER_DATABASE_PASSWORD; // Contraseña del super usuario de postgres

const dbname = process.env.DATABASE_NAME; // Nombre de la base de datos
const dbusername = process.env.DATABASE_USER;; // Nombre del usuario para la plataforma
const dbuserpassword = process.env.DATABASE_PASSWORD; // Contraseña del usuario de la plataforma
const scripts = require('./scripts')

// Array de los esquemas de la base de datos
const schemas = [
  'admin',
  'inventarios',
  'ventas',
  'rrhh',
  'proyectos'
]

// Se crea una instancia de conexión con sequelize
const sequelize = new Sequelize(dbname, superdbusername, superdbuserpassword, {
  host: hostDB,
  port: portDB,
  dialect: 'postgres',
  operatorsAliases : 0,
  logging: false, // Desactiva los mensajes en la consola
  define: {
    timestamps : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Función con la que se crea los esquemas de la base de datos
async function crearSchemas() {
  // Se crea la transacción
  const t = await sequelize.transaction();
  let sql; // declaramos la variable sql
  try {
    for (let index = 0; index < schemas.length; index++) {

      // Se crea la consulta para ser ejecutada
      sql = `SELECT COUNT(*) from pg_catalog.pg_namespace where nspname = '${schemas[index]}';`;
      // Verificamos sí existe el esquema en la base de datos
      const resp = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
        if(resp[0].count != 1) {
          // Se crea la consulta para ser ejecutada
          sql = `CREATE SCHEMA ${schemas[index]}`;
          // Creacion del esquema
          await sequelize.query(sql)

          // Se crea la consulta para ser ejecutada
          sql = `GRANT USAGE, CREATE ON SCHEMA ${schemas[index]} TO ${dbusername}`;
          // Le damos los privilegios de usar y crear objetos al usuario de la plataforma 
          await sequelize.query(sql);

          // Se crea la consulta para ser ejecutada
          sql = `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ${schemas[index]} TO ${dbusername}`;
          // Le damos los privilegios de SELECT, INSERT, UPDATE, DELETE a todas las tablas que pertenecen al esquema 
          await sequelize.query(sql);
         
          // Se crea la consulta para ser ejecutada
          sql = `ALTER DEFAULT PRIVILEGES IN SCHEMA ${schemas[index]} GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${dbusername}`;
          // Le establecemos los privilegios por DEFAULT
          await sequelize.query(sql);

          console.log("Esquema "+ schemas[index] +" creado!");
        }else{
          // Se crea la consulta para ser ejecutada
          sql = `GRANT USAGE, CREATE ON SCHEMA ${schemas[index]} TO ${dbusername}`;
          // Le damos los privilegios de usar y crear objetos al usuario de la plataforma
          await sequelize.query(sql);
        }
    }
    // Se hace un commit de la transaccion
    await t.commit();
  } catch (err) {
    // Se hace un rollback si algo llegase a fallar
    await t.rollback();
    console.log( `Error ${err}` );
  }
}

// Función para quitar los privilegios de crear objetos en los esquemas
async function revokeCreateOnSchemas() {
  // Se crea la transacción
  const t = await sequelize.transaction();
  try {
    for (let index = 0; index < schemas.length; index++) {
      // Se crea la consulta para ser ejecutada
      sql = `SELECT COUNT(*) from pg_catalog.pg_namespace where nspname = '${schemas[index]}';`;
      // Verificamos sí existe el esquema en la base de datos
      const resp = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
      if(resp[0].count != 0) {
          // Se crea la consulta para ser ejecutada
          sql = `REVOKE CREATE ON SCHEMA ${schemas[index]} FROM ${dbusername}`;
          // Revocamos los permisos de crear al usuario de la plataforma en el esquema
          await sequelize.query(sql);
        }
    }
    // Se hace un commit de la transacción
    await t.commit();
  } catch (err) {
    // Se hace un rollback si algo llegase a fallar
    await t.rollback();
    console.log( `Error ${err}` );
  }
}

// Función para crear todo lo codificado en el archivo de scripts.js
async function scriptExcecute() {
  // Se crea la transacción
  const t = await sequelize.transaction();
  try {
    // await sequelize.query(scripts);
    // Se hace un commit de la transacción
    await t.commit();
    console.log('Script ejecutado!');
  } catch (err) {
    // Se hace un rollback si algo llegase a fallar
    await t.rollback();
    console.log( `Error ${err}` );
  }
}

// Función para la creación de toda la estructura de la base de datos
async function crearEstructura() {
  // Se crea la transacción
  const t = await sequelize.transaction();
  // Requerimos la conexión con la que se conectan los modelos
  const db = require('./conexion');
  try {
    // Mandamos a ejecutar la función de crearSchemas
    await crearSchemas();
    // Requerimos los modelos
    require('./models');
    // Creacion de las tablas en base a los modelos
    await db.sync()
        .then(()=> {
          console.log('Tablas creadas!');
        })
        .catch(error => console.log(error));
    // Mandamos a ejecutar el revokeCreateOnSchena
    await revokeCreateOnSchemas();
    // ejecutamos el archivo de scripts
    await scriptExcecute()
    // Se hace un commit de la transacción
    await t.commit();
    
  } catch (err) {
    // Se hace un rollback si algo llegase a fallar
    await t.rollback();
    console.log( `Error ${err}` );
  } finally{
    // Finalizamos las conexiones con la base de datos
    await sequelize.close();
  }
}

crearEstructura();
