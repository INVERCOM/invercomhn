'use strict'
const Sequelize = require('../../database/postgres/conexion');
const AgentesModel = require('../../models/ventas/_tagentes');
const CiaModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['agen_nid'] > 0) && (req.body['agen_nid'] = null);
        if (req.body['agen_nid'] > 0) {
            const agente = req.body;
            await AgentesModel.update(agente, {where: { agen_nid: agente.agen_nid }, transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:agente, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(agente.agen_nid, agente.agen_nid, '_tagentes', [userLog], 2, [agente])
        } else {
            const agente = AgentesModel.build(req.body);
            await agente.save({transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:agente, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(agente.agen_nid, agente.agen_nid, '_tagentes', [userLog], 1, [agente])
        }
        await t.commit();
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

async function setSts( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        const agente = req.body;
        const result = await AgentesModel.update(agente, {where: { agen_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tagentes', [userLog], 0, [agente])
        result && res.status(201).send({type:'success', title:'Éxito', data:agente, message:'Registro cambiado exitosamente'});
        await t.commit();
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

async function setBulkSts( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        for await (const row of req.body['data']) {
            await AgentesModel.update({agen_nsts: row.agen_nsts}, {where: { agen_nid: row.agen_nid }, transaction: t});
            LogControllers.saveLog(row.agen_nid, row.agen_nid, '_tagentes', [userLog], 0, [row]);
        }
        res.status(201).send({type:'success', title:'Éxito', message:'Registros cambiados exitosamente'});
        await t.commit();
        
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

async function getAll( req, res ) {
    try {
        const data = await AgentesModel.findAll({
            where:{
                cia_nid: req.body['cia_nids'],
                agen_nsts: req.body['agen_nsts'] ? req.body['agen_nsts'] : 1
            },
            order:[['agen_nid', 'DESC']],
            include:[{
                model: CiaModel,
                as: 'cias'
            }]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

function definirRelaciones() {
    AgentesModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
    CiaModel.hasMany(AgentesModel,{as:'agens', foreignKey : 'cia_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}