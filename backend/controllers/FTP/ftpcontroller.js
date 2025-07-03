const fs = require('fs');
const ftp = require("basic-ftp");
// const options = {
//     host: process.env.FTP_HOST,
//     port: parseInt( process.env.FTP_PORT ),
//     user: process.env.FTP_USER,
//     password: process.env.FTP_PASSWORD,
//     secure: process.env.FTP_SECURE
// }

async function uploadFile(filename, file ) {    
    try {
        // Escribimos el archivo de forma temporal en nuestro servidor
        if ( file && file != '') {
            console.log('file', __dirname);
            await fs.promises.writeFile(__dirname + '/../../images' + filename, file, 'base64');
        }
        return true;
    } catch(error) {
        global._globalDebug && console.log( `Error FTP UP ${error}` );
        return false;
    }
}

async function downloadFile(file) {
    try {
        // leemos el dato binario
        const bitmap = fs.readFileSync(__dirname + '/../../images' + file);
        // Convertimos el dato binario a base46 
        return new Buffer.from(bitmap).toString('base64');
    } catch (error) {
        if (error.name == 'FTPError' && error.code == 550) {
            global._globalDebug && console.log(`${global._consoleColors.BgRed} ${global._consoleColors.BgGreen}`,'Error controlado: ', 'Imagen no encontrada');
        }else{
            global._globalDebug && console.log( `Error FTP DOWN ${error}` );
        }
        return false;
    }
}

// function deleteFile(filename){
//     try {
//         fs.unlinkSync(__dirname + filename);
//     } catch (error) {
//         global._globalDebug && console.log( `Error FTP ${error}` );
//     }
// }

module.exports = {
    uploadFile,
    downloadFile,
    // deleteFile
}