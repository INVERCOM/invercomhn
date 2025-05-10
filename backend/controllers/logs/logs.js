const mongoConnection = require('../../database/mongodb/database');
const Logs = require('../../models/admin/_tlogs')

async function saveLog(cia_nid, log_chg_nid, log_vtabla, log_tusuario, log_naccion, log_tvalues){
    try {
        new Logs({cia_nid, log_chg_nid, log_vtabla, log_tusuario, log_naccion, log_tvalues}).save();
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error log ${error}`, );
    }
}

module.exports = {
    saveLog
}

