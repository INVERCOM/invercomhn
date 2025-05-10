'use strict'
const Sequelize = require('../../database/postgres/conexion');
const ClienteModel = require('../../models/ventas/_tclientes');
const CiaModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['cli_nid'] > 0) && (req.body['cli_nid'] = null);
        if (req.body['cli_nid'] > 0) {
            const cliente = req.body;
            const result = await ClienteModel.update(cliente, {where: { cli_nid: cliente.cli_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:cliente, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(cliente.cli_nid, cliente.cli_nid, '_tclientes', [userLog], 2, [cliente])
        } else {
            const cliente = ClienteModel.build(req.body);
            const result = await cliente.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:cliente, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(cliente.cli_nid, cliente.cli_nid, '_tclientes', [userLog], 1, [cliente])
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
        const result = await ClienteModel.update(cliente, {where: { cli_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tclientes', [userLog], 0, [cliente])
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
            await ClienteModel.update({cli_nsts: row.cli_nsts}, {where: { cli_nid: row.cli_nid }, transaction: t});
            LogControllers.saveLog(row.cli_nid, row.cli_nid, '_tclientes', [userLog], 0, [row]);
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
        const data = await ClienteModel.findAll({
            where:{
                cia_nid: req.body['cia_nids'],
                cli_nsts: req.body['cli_nsts'] ? req.body['cli_nsts'] : 1
            },
            order:[['cli_nid', 'DESC']],
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
    ClienteModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
    CiaModel.hasMany(ClienteModel,{as:'clis', foreignKey : 'cia_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}