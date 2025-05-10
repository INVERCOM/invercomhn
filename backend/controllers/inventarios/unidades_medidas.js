'use strict'
const Sequelize = require('../../database/postgres/conexion');
const UnidadesMedidasModel = require('../../models/inventarios/_tunidades_medidas');
const CiaModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['unimed_nid'] > 0) && (req.body['unimed_nid'] = null);
        if (req.body['unimed_nid'] > 0) {
            const unidadMedida = req.body;
            await UnidadesMedidasModel.update(unidadMedida, {where: { unimed_nid: unidadMedida.unimed_nid }, transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:unidadMedida, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(unidadMedida.unimed_nid, unidadMedida.unimed_nid, '_tunidades_medidas', [userLog], 2, [unidadMedida])
        } else {
            const unidadMedida = UnidadesMedidasModel.build(req.body);
            await unidadMedida.save({transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:unidadMedida, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(unidadMedida.unimed_nid, unidadMedida.unimed_nid, '_tunidades_medidas', [userLog], 1, [unidadMedida])
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
        const unidadMedida = req.body;
        const result = await UnidadesMedidasModel.update(unidadMedida, {where: { unimed_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tunidades_medidas', [userLog], 0, [unidadMedida])
        result && res.status(201).send({type:'success', title:'Éxito', data:unidadMedida, message:'Registro cambiado exitosamente'});
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
            await UnidadesMedidasModel.update({unimed_nsts: row.unimed_nsts}, {where: { unimed_nid: row.unimed_nid }, transaction: t});
            LogControllers.saveLog(row.unimed_nid, row.unimed_nid, '_tunidades_medidas', [userLog], 0, [row]);
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
        const data = await UnidadesMedidasModel.findAll({
            where:{
                cia_nid: req.body['cia_nids'],
                unimed_nsts: req.body['unimed_nsts'] ? req.body['unimed_nsts'] : 1
            },
            order:[['unimed_nid', 'DESC']],
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
    UnidadesMedidasModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
    CiaModel.hasMany(UnidadesMedidasModel,{as:'unimeds', foreignKey : 'cia_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}