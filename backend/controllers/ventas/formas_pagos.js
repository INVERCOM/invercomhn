'use strict'
const Sequelize = require('../../database/postgres/conexion');
const FormasPagosModel = require('../../models/ventas/_tformas_pagos');
const CiaModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['forpag_nid'] > 0) && (req.body['forpag_nid'] = null);
        if (req.body['forpag_nid'] > 0) {
            const formaPago = req.body;
            await FormasPagosModel.update(formaPago, {where: { forpag_nid: formaPago.forpag_nid }, transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:formaPago, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(formaPago.forpag_nid, formaPago.forpag_nid, '_tformas_pagos', [userLog], 2, [formaPago])
        } else {
            const formaPago = FormasPagosModel.build(req.body);
            await formaPago.save({transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:formaPago, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(formaPago.forpag_nid, formaPago.forpag_nid, '_tformas_pagos', [userLog], 1, [formaPago])
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
        const formaPago = req.body;
        const result = await FormasPagosModel.update(formaPago, {where: { forpag_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tformas_pagos', [userLog], 0, [formaPago])
        result && res.status(201).send({type:'success', title:'Éxito', data:formaPago, message:'Registro cambiado exitosamente'});
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
            await FormasPagosModel.update({forpag_nsts: row.forpag_nsts}, {where: { forpag_nid: row.forpag_nid }, transaction: t});
            LogControllers.saveLog(row.forpag_nid, row.forpag_nid, '_tformas_pagos', [userLog], 0, [row]);
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
        const data = await FormasPagosModel.findAll({
            where:{
                cia_nid: req.body['cia_nids'],
                forpag_nsts: req.body['forpag_nsts'] ? req.body['forpag_nsts'] : 1
            },
            order:[['forpag_nid', 'DESC']],
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
    FormasPagosModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
    CiaModel.hasMany(FormasPagosModel,{as:'forpags', foreignKey : 'cia_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}