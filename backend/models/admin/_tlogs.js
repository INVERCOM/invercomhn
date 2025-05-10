const { Schema, model } = require('mongoose');
const ObjectId = Schema.ObjectId;

const _tlogs = new Schema({
    cia_nid: Number,
    log_chg_nid: Number,
    log_vtabla: String,
    log_tusuario: Array,
    log_ttfecha_creacion: {
        type: Date,
        default: Date.now
    },
    log_naccion: Number, // 1 -> Creación, 2 -> Actualization, 0 -> Inactivación/Anulación, 3 -> Restaurar, 4 -> Asignación, 5 -> Cambio contraseña (1->Restauración [5.1] 2->Cambio admin [5.2] 3-> Solicitud de cambio [5.3]), -1 -> Eliminación permanente
    log_tvalues: Array
  });

module.exports = model('_tlogs', _tlogs)
