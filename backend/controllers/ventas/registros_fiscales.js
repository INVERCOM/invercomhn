'use strict'
const Sequelize = require('../../database/postgres/conexion');
const RegistrosFiscalesModel = require('../../models/ventas/_tregistros_fiscales');
const PuntosEmisionModel = require('../../models/ventas/_tpuntos_emision');
const DocumentosFiscalesModel = require('../../models/ventas/_tdocumentos_fiscales');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['regfis_nid'] > 0) && (req.body['regfis_nid'] = null);
        if (req.body['regfis_nid'] > 0) {
            const registroFiscal = req.body;
            await RegistrosFiscalesModel.update(registroFiscal, {where: { regfis_nid: registroFiscal.regfis_nid }, transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:registroFiscal, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(registroFiscal.regfis_nid, registroFiscal.regfis_nid, '_tregistros_fiscales', [userLog], 2, [registroFiscal])
        } else {
            const registroFiscal = RegistrosFiscalesModel.build(req.body);
            await registroFiscal.save({transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:registroFiscal, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(registroFiscal.regfis_nid, registroFiscal.regfis_nid, '_tregistros_fiscales', [userLog], 1, [registroFiscal])
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
        const registroFiscal = req.body;
        const result = await RegistrosFiscalesModel.update(registroFiscal, {where: { regfis_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tregistros_fiscales', [userLog], 0, [registroFiscal])
        result && res.status(201).send({type:'success', title:'Éxito', data:registroFiscal, message:'Registro cambiado exitosamente'});
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
            await RegistrosFiscalesModel.update({regfis_nsts: row.regfis_nsts}, {where: { regfis_nid: row.regfis_nid }, transaction: t});
            LogControllers.saveLog(row.regfis_nid, row.regfis_nid, '_tregistros_fiscales', [userLog], 0, [row]);
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
        const data = await RegistrosFiscalesModel.findAll({
            where:{ regfis_nsts: req.body['regfis_nsts'] ? req.body['regfis_nsts'] : 1 },
            order:[['regfis_nid', 'DESC']],
            include:[{
                model: PuntosEmisionModel,
                as: 'punemis',
                required: true,
            },{
                model: DocumentosFiscalesModel,
                as: 'docfiss',
                where: { cia_nid: req.body['cia_nids'] },
                required: true,
            }]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

async function getAllByPuntoEmision( req, res ) {
    try {
        const data = await RegistrosFiscalesModel.findAll({
            where:{ regfis_nsts: req.body['regfis_nsts'] ? req.body['regfis_nsts'] : 1 },
            order:[['regfis_nid', 'DESC']],
            include:[{
                model: PuntosEmisionModel,
                where: {punemi_nid: req.body['punemi_nids'] },
                as: 'punemis',
                required: true,
            },{
                model: DocumentosFiscalesModel,
                as: 'docfiss',
                required: true,
            }]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

function definirRelaciones() {
    RegistrosFiscalesModel.belongsTo(PuntosEmisionModel,{as:'punemis', foreignKey: 'punemi_nid'});
    PuntosEmisionModel.hasMany(RegistrosFiscalesModel,{as:'regfiss', foreignKey : 'punemi_nid'});

    RegistrosFiscalesModel.belongsTo(DocumentosFiscalesModel,{as:'docfiss', foreignKey: 'docfis_nid'});
    DocumentosFiscalesModel.hasMany(RegistrosFiscalesModel,{as:'regfiss', foreignKey : 'docfis_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll,
    getAllByPuntoEmision
}