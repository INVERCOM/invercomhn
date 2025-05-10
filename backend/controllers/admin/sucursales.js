'use strict'
const { Op } = require('sequelize');
const Sequelize = require('../../database/postgres/conexion');
const SucursalesModel = require('../../models/admin/_tsucursales');
const CiasModel = require('../../models/admin/_tcias');
const SucursalesUsuariosModel = require('../../models/admin/_tasig_sucursal_user');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['sucu_nid'] > 0) && (req.body['sucu_nid'] = null);
        if (req.body['sucu_nid'] > 0) {
            const sucursal = req.body;
            const result = await SucursalesModel.update(sucursal, {where: { sucu_nid: sucursal.sucu_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:sucursal, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(sucursal.sucu_nid, sucursal.sucu_nid, '_tsucursales', [userLog], 2, [sucursal])
        } else {
            const sucursal = SucursalesModel.build(req.body);
            const result = await sucursal.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:sucursal, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(sucursal.sucu_nid, sucursal.sucu_nid, '_tsucursales', [userLog], 1, [sucursal])
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
        const sucursal = req.body;
        const result = await SucursalesModel.update(sucursal, {where: { sucu_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tsucursales', [userLog], 0, [sucursal])
        result && res.status(201).send({type:'success', title:'Éxito', data:sucursal, message:'Registro cambiado exitosamente'});
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
            await SucursalesModel.update({sucu_nsts: row.sucu_nsts}, {where: { sucu_nid: row.sucu_nid }, transaction: t});
            LogControllers.saveLog(row.sucu_nid, row.sucu_nid, '_tsucursales', [userLog], 0, [row]);
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
        const data = await SucursalesModel.findAll({
            where:{
                cia_nid: req.body['cia_nids'] ? req.body['cia_nids'] : {[Op.gt]: 0},
                sucu_nsts: req.body['sucu_nsts'] ? req.body['sucu_nsts'] : 1
            },
            order:[['sucu_nid', 'DESC']],
            include:[{
                model: CiasModel,
                as: 'cias'
            }]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

async function getSucursalUsuarios( req, res ) {
    try {
        const {id} = req.params;
        const data = await SucursalesUsuariosModel.findAll({ 
            where:{ sucu_nid: id },
        });
        res.json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

async function saveSucursalUsuarios( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        await SucursalesUsuariosModel.destroy({ where:{ sucu_nid: id } });
        await SucursalesUsuariosModel.bulkCreate(req.body['asig']);
        LogControllers.saveLog(0, id, '_tasig_sucursal_user', [userLog], 4, req.body['asig']);
        res.status(201).send({type:'success', title:'Éxito', data:req.body, message:'Registro guardado exitosamente'});
        await t.commit();
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

function definirRelaciones() {
    SucursalesModel.belongsTo(CiasModel,{as:'cias', foreignKey: 'cia_nid'});
    CiasModel.hasMany(SucursalesModel,{as:'sucus', foreignKey : 'cia_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getSucursalUsuarios,
    saveSucursalUsuarios,  
    getAll
}