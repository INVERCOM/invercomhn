// Requerimos el ORM "Sequelize"
const Sequelize = require('sequelize');

const hostDB = process.env.DATABASE_HOST; // Host en donde esta alojado la base de datos
const portDB = process.env.DATABASE_PORT; // Puerto en donde esta alojado la base de datos

const superdbname = process.env.SUPER_DATABASE_NAME; // Nombre de la super base de datos
const superdbusername = process.env.SUPER_USER_DATABASE_NAME; // Nombre del super usuario de postgres
const superdbuserpassword = process.env.SUPER_USER_DATABASE_PASSWORD; // Contraseña del super usuario de postgres

const dbname = process.env.DATABASE_NAME; // Nombre de la base de datos
const dbusername = process.env.DATABASE_USER; // Nombre del usuario para la plataforma
const dbuserpassword = process.env.DATABASE_PASSWORD; // Contraseña del usuario de la plataforma
// Se crea una instancia de conexion con sequelize
const sequelize = new Sequelize(superdbname, superdbusername, superdbuserpassword, {
    host: hostDB,
    port: portDB,
    dialect: 'postgres',
    logging: false, // Desactiva los mensajes en la consola de sequelize
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Creación la base de datos
async function crearDB() {
    // Se crea la transacción
    const t = await sequelize.transaction();
    try {
        // Se crea la consulta para ser ejecutada
        let sql = `SELECT COUNT(*) FROM pg_database WHERE datname = '${dbname}'`;
        
        // Verificamos sí existe la base de datos
        resultado = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
        if(resultado[0]['count'] < 1) {
            // Se crea la consulta para ser ejecutada
            sql = `CREATE DATABASE ${dbname}`;
            // Creamos la base de datos 
            await sequelize.query(sql);
            // Se crea la consulta para ser ejecutada
            sql = `REVOKE ALL ON DATABASE ${dbname} FROM public`;
            // Quitamos los privilegios publicos de la base de datos
            await sequelize.query(sql);
            console.log("La base de datos ha sido creada!");
            // Mandamos a ejecutar la funcion para la creacion del usuario
        }else{
            console.log("La base de datos ya existe!");
        }
        // Mandamos a ejecutar la funcion para crear el usuario de la base de datos
        await crearUserDB();
        // Se hace un commit de la transaccion
        await t.commit();

    } catch (err) {
        // Se hace un rollback si algo llegase a fallar
        await t.rollback();
        console.log( `Error ${err}` );
    } finally{
        // Cerramos las conexiones
        await sequelize.close();
    }
}

// Creación del usuario
async function crearUserDB() {
     // Se crea la transacción
    const t = await sequelize.transaction();
    try {
        // Se crea la consulta para ser ejecutada
        let sql = `SELECT COUNT(*) FROM pg_user where usename = '${dbusername}'`;
        // Verificamos si el usuario existe en postgress
        resultado = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
        if(resultado[0].count < 1) {
            // Se crea la consulta para ser ejecutada
            sql = `CREATE user ${dbusername} password '${dbuserpassword}';`;
            // Creamos el usuario si este no existe
            await sequelize.query(sql);
            console.log("El usuario ha sido creado!");
            // Se crea la consulta para ser ejecutada
            sql = `GRANT CONNECT ON DATABASE ${dbname} TO ${dbusername}`;
            // Le damos el prilegio de conexion al usuario sobre la base de datos
            await sequelize.query(sql);
            // Requerimos el archivo en donde se crea la estructura de la base de datos
            require('./db');
        }else{
            console.log("El usuario ya existe!");
            // Se crea la consulta para ser ejecutada
            sql = `GRANT CONNECT ON DATABASE ${dbname} TO ${dbusername}`;
            // Le damos el prilegio de conexion al usuario sobre la base de datos
            await sequelize.query(sql);
            // Requerimos el archivo en donde se crea la estructura de la base de datos
            require('./db');
        }
        // Se hace un commit de la transaccion
        await t.commit();
        
    } catch (err) {
        // Se hace un rollback si algo llegase a fallar
        await t.rollback();
        console.log( `Error ${err}` );
        
    }finally{
        // Cerramos las conexiones
        await sequelize.close();
    }

}

// Ejecutamos la creación de la base de datos
crearDB();