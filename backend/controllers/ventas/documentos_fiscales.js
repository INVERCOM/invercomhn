'use strict'
const Sequelize = require('../../database/postgres/conexion');
const DocumentosFiscalesModel = require('../../models/ventas/_tdocumentos_fiscales');
const CiaModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['docfis_nid'] > 0) && (req.body['docfis_nid'] = null);
        if (req.body['docfis_nid'] > 0) {
            const documentoFiscal = req.body;
            await DocumentosFiscalesModel.update(documentoFiscal, {where: { docfis_nid: documentoFiscal.docfis_nid }, transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:documentoFiscal, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(documentoFiscal.docfis_nid, documentoFiscal.docfis_nid, '_tdocumentos_fiscales', [userLog], 2, [documentoFiscal])
        } else {
            const documentoFiscal = DocumentosFiscalesModel.build(req.body);
            await documentoFiscal.save({transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:documentoFiscal, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(documentoFiscal.docfis_nid, documentoFiscal.docfis_nid, '_tdocumentos_fiscales', [userLog], 1, [documentoFiscal])
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
        const documentoFiscal = req.body;
        const result = await DocumentosFiscalesModel.update(documentoFiscal, {where: { docfis_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tdocumentos_fiscales', [userLog], 0, [documentoFiscal])
        result && res.status(201).send({type:'success', title:'Éxito', data:documentoFiscal, message:'Registro cambiado exitosamente'});
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
            await DocumentosFiscalesModel.update({docfis_nsts: row.docfis_nsts}, {where: { docfis_nid: row.docfis_nid }, transaction: t});
            LogControllers.saveLog(row.docfis_nid, row.docfis_nid, '_tdocumentos_fiscales', [userLog], 0, [row]);
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
        const data = await DocumentosFiscalesModel.findAll({
            where:{
                cia_nid: req.body['cia_nids'],
                docfis_nsts: req.body['docfis_nsts'] ? req.body['docfis_nsts'] : 1
            },
            order:[['docfis_nid', 'DESC']],
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
    DocumentosFiscalesModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
    CiaModel.hasMany(DocumentosFiscalesModel,{as:'docfiss', foreignKey : 'cia_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}