'use strict'
const Sequelize = require('../../database/postgres/conexion');
const Modulos = require('../../models/admin/_tmodulos');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['modu_nid'] > 0) && (req.body['modu_nid'] = null);
        if (req.body['modu_nid'] > 0) {
            const modulo = req.body;
            const result = await Modulos.update(modulo, {where: { modu_nid: modulo.modu_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:modulo, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(0, modulo.modu_nid, '_tmodulos', [userLog], 2, [modulo])
        } else {
            const modulo = Modulos.build(req.body);
            const result = await modulo.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:modulo, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(0, modulo.modu_nid, '_tmodulos', [userLog], 1, [modulo])
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
        const modulo = req.body;
        const result = await Modulos.update(modulo, {where: { modu_nid: id }, transaction: t });
        LogControllers.saveLog(0, id, '_tmodulos', [userLog], 0, [modulo])
        result && res.status(201).send({type:'success', title:'Éxito', data:modulo, message:'Registro cambiado exitosamente'});
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
            await Modulos.update({modu_nsts: row.modu_nsts}, {where: { modu_nid: row.modu_nid }, transaction: t});
            LogControllers.saveLog(0, row.modu_nid, '_tmodulos', [userLog], 0, [row]);
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
        const data = await Modulos.findAll({
            where:{modu_nsts: req.body['modu_nsts'] ? req.body['modu_nsts'] : 1},
            order:[['modu_nid', 'DESC']]
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