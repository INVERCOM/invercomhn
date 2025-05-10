require('dotenv').config();
const app = require('./app');
const port = process.env.PORT ? process.env.PORT : (process.env.SERVERPORT ? process.env.SERVERPORT : 4004)
const http  =   require('http');
const socket_redis = require('socket.io-redis');

global._globalDebug = true
global.FgRed = "\n\x1b[31m%s\x1b[0m";

const initEjecucion = process.argv[3] 
const tipoEjecucion = process.argv[2]

if(initEjecucion == 'init' || tipoEjecucion  == 'init'){
    require('./database/postgres/index');
}

// if( tipoEjecucion == 'dev' || process.env.PRODUCTION=='false' ){
    const server = http.createServer(app)
    const io = require('./io')
    io.adapter(socket_redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, auth_pass: process.env.REDIS_PASSWORD }));
    io.attach(server,{pingInterval:1000});
    server.listen(port, () => {
        console.log( `Express corriendo en el puerto ${port}`, 'Online DEV' );
    });
// }else{
//     const fs = require('fs')
//     const https = require("https")
//     const privateKey  = fs.readFileSync(__dirname+'/SSL/key.key','utf8');
//     const certificate = fs.readFileSync(__dirname+'/SSL/crt.crt','utf8');
//     const ca5 = [fs.readFileSync(__dirname+'/SSL/gd1.crt','utf8'), 
//                 fs.readFileSync(__dirname+'/SSL/gd2.crt','utf8'),
//                 fs.readFileSync(__dirname+'/SSL/gd3.crt','utf8')];
//     const credentials = {key: privateKey, passphrase: 'T!v!Tr@c32018', ca:ca5, cert: certificate ,requestCert: false,rejectUnauthorized: false};
//     const httpsServer = https.createServer(credentials, app);
//     const io = require('./io')
//     io.attach(httpsServer,{pingInterval:1000});
//     httpsServer.listen(port,function(){
//         const host = "localhost";
//         const port = httpsServer.address().port;
//         console.log(`server running at https://%s:%s `,host,port,'Online PROD');
//     });
// }

require('./database/mongodb/database');