const { Op } = require('sequelize');
const Sequelize = require('../../database/postgres/conexion');
const Lotes = require('../../models/proyectos/_tlotes');
const Unimeds = require('../../models/inventarios/_tunidades_medidas');
const Proyectos = require('../../models/proyectos/_tproyectos');
const logsController = require('../logs/logs');

async function createLote( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        if (req.body['lote_nid'] > 0) {
            const lote = req.body;
            const result = await Lotes.update(lote, {where: { lote_nid: lote.lote_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:lote, message:'Registro actualizado exitosamente'});
            logsController.saveLog(lote.lote_nid, lote.lote_nid, '_tlotes', [userLog], 2, [lote]);

        } else {
            const lote = Lotes.build(req.body);
            const result = await lote.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:lote, message:'Registro guardado exitosamente'});
            logsController.saveLog(lote.lote_nid, lote.lote_nid, '_tlotes', [userLog], 1, [lote]);
        }
        await t.commit();
    } catch (error) {
        await t.rollback();
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'create.toast.title_error' , message:'create.toast.srverror'});
    }
}

async function setSts( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        const lote = req.body;
        const result = await Lotes.update({'lote_nsts': lote['lote_nsts'] }, {where: { lote_nid: id },  logging: function (str) { sql = str} });
        logsController.saveLog(id, id, '_tlotes', [userLog], 0, [lote])
        result && res.status(201).send({type:'success', title:'Éxito', data:lote, message:'Registro cambiado exitosamente'});
        await t.commit();
    } catch (error) {
        await t.rollback();
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'update.toast.title_error' , message:'update.toast.srverror'});
    }
}

async function getAll( req, res ) {
    try {
        const data = await Lotes.findAll({ 
                where:{
                    lote_nsts: req.body['lote_nsts'] ? req.body['lote_nsts'] : [1,2,3,4,5,6]
                },
                order: [ ['lote_nid', 'DESC'] ],
                as:'_tlotes',
                include: [{
                    model:Proyectos,
                    where:{ sucu_nid: req.body['sucu_nids'] ? req.body['sucu_nids'] : [] },
                    required: false,
                    as:'_tproyectos',
                },{
                    model:Unimeds,
                    as:'_tunidades_medidas',
                }
            ] 
        });
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error ', title:'update.toast.title_error' , message:'update.toast.srverror'});   
    }
}

function definirRelacionesLotes() {
    Lotes.belongsTo(Proyectos,{as:'_tproyectos', foreignKey: 'proy_nid'});  
    Proyectos.hasMany(Lotes,{as:'_tlotes', foreignKey : 'proy_nid'});

    Lotes.belongsTo(Unimeds,{as:'_tunidades_medidas', foreignKey: 'unimed_nid'});  
    Unimeds.hasMany(Lotes,{as:'_tlotes', foreignKey : 'unimed_nid'});
}

definirRelacionesLotes();

module.exports = {
    createLote,
    setSts,
    getAll
}