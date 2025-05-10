'use strict'
const Sequelize = require('../../database/postgres/conexion');
const ImpuestosModel = require('../../models/inventarios/_timpuestos');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['isv_nid'] > 0) && (req.body['isv_nid'] = null);
        if (req.body['isv_nid'] > 0) {
            const imp = req.body;
            const result = await ImpuestosModel.update(imp, {where: { isv_nid: imp.isv_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:imp, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(0, imp.isv_nid, '_timpuestos', [userLog], 2, [imp])
        } else {
            const imp = ImpuestosModel.build(req.body);
            const result = await imp.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:imp, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(0, imp.isv_nid, '_timpuestos', [userLog], 1, [imp])
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
        const imp = req.body;
        const result = await ImpuestosModel.update(imp, {where: { isv_nid: id }, transaction: t });
        LogControllers.saveLog(0, id, '_timpuestos', [userLog], 0, [imp])
        result && res.status(201).send({type:'success', title:'Éxito', data:imp, message:'Registro cambiado exitosamente'});
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
            await ImpuestosModel.update({isv_nsts: row.isv_nsts}, {where: { isv_nid: row.isv_nid }, transaction: t});
            LogControllers.saveLog(0, row.isv_nid, '_timpuestos', [userLog], 0, [row]);
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
        const data = await ImpuestosModel.findAll({
            where:{isv_nsts: req.body['isv_nsts'] ? req.body['isv_nsts'] : 1},
            order:[['isv_nid', 'ASC']]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}