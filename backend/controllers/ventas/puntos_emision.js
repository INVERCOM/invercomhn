'use strict'
const Sequelize = require('../../database/postgres/conexion');
const PuntosEmisionModel = require('../../models/ventas/_tpuntos_emision');
const SucursalModel = require('../../models/admin/_tsucursales');
const CiasModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['punemi_nid'] > 0) && (req.body['punemi_nid'] = null);
        if (req.body['punemi_nid'] > 0) {
            const cliente = req.body;
            const result = await PuntosEmisionModel.update(cliente, {where: { punemi_nid: cliente.punemi_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:cliente, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(cliente.punemi_nid, cliente.punemi_nid, '_tpuntos_emision', [userLog], 2, [cliente])
        } else {
            const cliente = PuntosEmisionModel.build(req.body);
            const result = await cliente.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:cliente, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(cliente.punemi_nid, cliente.punemi_nid, '_tpuntos_emision', [userLog], 1, [cliente])
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
        const cliente = req.body;
        const result = await PuntosEmisionModel.update(cliente, {where: { punemi_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tpuntos_emision', [userLog], 0, [cliente])
        result && res.status(201).send({type:'success', title:'Éxito', data:cliente, message:'Registro cambiado exitosamente'});
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
            await PuntosEmisionModel.update({punemi_nsts: row.punemi_nsts}, {where: { punemi_nid: row.punemi_nid }, transaction: t});
            LogControllers.saveLog(row.punemi_nid, row.punemi_nid, '_tpuntos_emision', [userLog], 0, [row]);
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
        const data = await PuntosEmisionModel.findAll({
            where:{
                // sucu_nid: req.body['sucu_nids'],
                punemi_nsts: req.body['punemi_nsts'] ? req.body['punemi_nsts'] : 1
            },
            order:[['punemi_nid', 'DESC']],
            include:[{
                model: SucursalModel,
                where: { cia_nid: req.body['cia_nids'] },
                required: true,
                as: 'sucus',
                include:[{
                    model: CiasModel,
                    as: 'cias',
                    required: true,
                }]
            }]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

function definirRelaciones() {
    PuntosEmisionModel.belongsTo(SucursalModel,{as:'sucus', foreignKey: 'sucu_nid'});
    SucursalModel.hasMany(PuntosEmisionModel,{as:'punemis', foreignKey : 'sucu_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}