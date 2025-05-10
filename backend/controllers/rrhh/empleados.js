'use strict'
const Sequelize = require('../../database/postgres/conexion');
const EmpleadoModel = require('../../models/rrhh/_templeados');
const CiaModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['emp_nid'] > 0) && (req.body['emp_nid'] = null);
        if (req.body['emp_nid'] > 0) {
            const empleado = req.body;
            const result = await EmpleadoModel.update(empleado, {where: { emp_nid: empleado.emp_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:empleado, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(empleado.emp_nid, empleado.emp_nid, '_templeados', [userLog], 2, [empleado])
        } else {
            const empleado = EmpleadoModel.build(req.body);
            const result = await empleado.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:empleado, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(empleado.emp_nid, empleado.emp_nid, '_templeados', [userLog], 1, [empleado])
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
        const empleado = req.body;
        const result = await EmpleadoModel.update(empleado, {where: { emp_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_templeados', [userLog], 0, [empleado])
        result && res.status(201).send({type:'success', title:'Éxito', data:empleado, message:'Registro cambiado exitosamente'});
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
            await EmpleadoModel.update({emp_nsts: row.emp_nsts}, {where: { emp_nid: row.emp_nid }, transaction: t});
            LogControllers.saveLog(row.emp_nid, row.emp_nid, '_templeados', [userLog], 0, [row]);
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
        const data = await EmpleadoModel.findAll({
            where:{
                cia_nid: req.body['cia_nids'],
                emp_nsts: req.body['emp_nsts'] ? req.body['emp_nsts'] : 1
            },
            order:[['emp_nid', 'DESC']],
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
    EmpleadoModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
    CiaModel.hasMany(EmpleadoModel,{as:'emps', foreignKey : 'cia_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}