'use strict'
const Sequelize = require('../../database/postgres/conexion');
const AccesosModel = require('../../models/admin/_taccesos');
const ModulosModel = require('../../models/admin/_tmodulos');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['acce_nid'] > 0) && (req.body['acce_nid'] = null);
        if (req.body['acce_nid'] > 0) {
            const acceso = req.body;
            const result = await AccesosModel.update(acceso, {where: { acce_nid: acceso.acce_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:acceso, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(acceso.acce_nid, acceso.acce_nid, '_taccesos', [userLog], 2, [acceso])
        } else {
            const acceso = AccesosModel.build(req.body);
            const result = await acceso.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:acceso, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(acceso.acce_nid, acceso.acce_nid, '_taccesos', [userLog], 1, [acceso])
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
        const acceso = req.body;
        const result = await AccesosModel.update(acceso, {where: { acce_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_taccesos', [userLog], 0, [acceso])
        result && res.status(201).send({type:'success', title:'Éxito', data:acceso, message:'Registro cambiado exitosamente'});
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
            await AccesosModel.update({acce_nsts: row.acce_nsts}, {where: { acce_nid: row.acce_nid }, transaction: t});
            LogControllers.saveLog(row.acce_nid, row.acce_nid, '_taccesos', [userLog], 0, [row]);
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
        const data = await AccesosModel.findAll({
            where:{acce_nsts: req.body['acce_nsts'] ? req.body['acce_nsts'] : 1},
            order:[['acce_nid', 'DESC']],
            include:[{
                model: ModulosModel,
                as: 'modus'
            }]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

function definirRelaciones() {
    AccesosModel.belongsTo(ModulosModel,{as:'modus', foreignKey: 'modu_nid'});
    ModulosModel.hasMany(AccesosModel,{as:'acces', foreignKey : 'modu_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}