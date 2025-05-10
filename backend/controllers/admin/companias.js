'use strict'
const { Op } = require("sequelize");
const Sequelize = require('../../database/postgres/conexion');
const Cias = require('../../models/admin/_tcias');
const CiasModulos = require('../../models/admin/_tasig_cias_modulos');
const Monedas = require('../../models/admin/_tmonedas');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['cia_nid'] > 0) && (req.body['cia_nid'] = null);
        if (req.body['cia_nid'] > 0) {
            const cia = req.body;
            const result = await Cias.update(cia, {where: { cia_nid: cia.cia_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:cia, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(cia.cia_nid, cia.cia_nid, '_tcias', [userLog], 2, [cia])
        } else {
            const cia = Cias.build(req.body);
            const result = await cia.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:cia, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(cia.cia_nid, cia.cia_nid, '_tcias', [userLog], 1, [cia])
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
        const cia = req.body;
        const result = await Cias.update(cia, {where: { cia_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tcias', [userLog], 0, [cia])
        result && res.status(201).send({type:'success', title:'Éxito', data:cia, message:'Registro cambiado exitosamente'});
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
            await Cias.update({cia_nsts: row.cia_nsts}, {where: { cia_nid: row.cia_nid }, transaction: t});
            LogControllers.saveLog(row.cia_nid, row.cia_nid, '_tcias', [userLog], 0, [row]);
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
        const data = await Cias.findAll({
            where:{
                cia_nid: req.body['cia_nids'] ? req.body['cia_nids'] : { [Op.gt]: 0 },
                cia_nsts: req.body['cia_nsts'] ? req.body['cia_nsts'] : 1
            },
            order:[['cia_nid', 'DESC']],
            include:[{
                model: Monedas,
                as: 'mones'
            }]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

async function getCiasModulos( req, res ) {
    try {
        const {id} = req.params;
        const data = await CiasModulos.findAll({ where:{ cia_nid: id } });
        res.json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

async function saveCiasModulos( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        await CiasModulos.destroy({ where:{ cia_nid: id } });
        await CiasModulos.bulkCreate(req.body['asig']);
        LogControllers.saveLog(id, id, '_tasig_cias_modulos', [userLog], 4, req.body['asig']);
        res.status(201).send({type:'success', title:'Éxito', data:req.body, message:'Registro guardado exitosamente'});
        await t.commit();
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

function definirRelacionesCompanias() {
    Cias.belongsTo(Monedas,{as:'mones', foreignKey: 'mone_nid'});
    Monedas.hasMany(Cias,{as:'cias', foreignKey : 'mone_nid'});
}

definirRelacionesCompanias();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getCiasModulos,
    saveCiasModulos,
    getAll
}