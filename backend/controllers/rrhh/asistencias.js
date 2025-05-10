'use strict'
const Sequelize = require('../../database/postgres/conexion');
const { Op } = require('sequelize');
const AsistenciaModel = require('../../models/rrhh/_tasistencias');
const CiaModel = require('../../models/admin/_tcias');
const EmpleadoModel = require('../../models/rrhh/_templeados');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    console.log(req.body);
    try {
        !(req.body['asis_nid'] > 0) && (req.body['asis_nid'] = null);
        if (req.body['asis_nid'] > 0) {
            const asistencia = req.body;
            const result = await AsistenciaModel.update(asistencia, {where: { asis_nid: asistencia.asis_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:asistencia, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(asistencia.asis_nid, asistencia.asis_nid, '_tasistencias', [userLog], 2, [asistencia])
        } else {
            const asistencia = AsistenciaModel.build(req.body);
            const result = await asistencia.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:asistencia, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(asistencia.asis_nid, asistencia.asis_nid, '_tasistencias', [userLog], 1, [asistencia])
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
        const asistencia = req.body;
        const result = await AsistenciaModel.update(asistencia, {where: { asis_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tasistencias', [userLog], 0, [asistencia])
        result && res.status(201).send({type:'success', title:'Éxito', data:asistencia, message:'Registro cambiado exitosamente'});
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
            await AsistenciaModel.update({asis_nsts: row.asis_nsts}, {where: { asis_nid: row.asis_nid }, transaction: t});
            LogControllers.saveLog(row.asis_nid, row.asis_nid, '_tasistencias', [userLog], 0, [row]);
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
        const where = {}
        req.body['cia_nids'] && (where['cia_nid'] = req.body['cia_nids']);
        req.body['emp_nids'] && (where['emp_nid'] = req.body['emp_nids']);
        req.body['asis_nsts'] && (where['asis_nsts'] = req.body['asis_nsts']);
        req.body['fechas'] && req.body['fechas'].fechaInicio != 'TODOS' && (where['asis_ttfechaentrada'] = { [Op.between]: [req.body['fechas'].fechaInicio, req.body['fechas'].fechaFinal] })
        const data = await AsistenciaModel.findAll({
            where,
            order:[['asis_nid', 'DESC']],
            include:[{
                model: CiaModel,
                as: 'cias'
            },{
                model: EmpleadoModel,
                as: 'emps'
            }]
        });

        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

async function getLatest( req, res ) {
    try {
        const where = {}
        req.body['cia_nids'] && (where['cia_nid'] = req.body['cia_nids']);
        req.body['emp_nids'] && (where['emp_nid'] = req.body['emp_nids']);
        req.body['asis_nsts'] && (where['asis_nsts'] = req.body['asis_nsts']);
        const data = await AsistenciaModel.findAll({
            where,
            order:[['asis_nid', 'DESC']],
            include:[{
                model: CiaModel,
                as: 'cias'
            },{
                model: EmpleadoModel,
                as: 'emps'
            }],
            limit: 10
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

function definirRelaciones() {
    AsistenciaModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
    CiaModel.hasMany(AsistenciaModel,{as:'asis', foreignKey : 'cia_nid'});

    AsistenciaModel.belongsTo(EmpleadoModel,{as:'emps', foreignKey: 'emp_nid'});
    EmpleadoModel.hasMany(AsistenciaModel,{as:'asis', foreignKey : 'emp_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll,
    getLatest
}