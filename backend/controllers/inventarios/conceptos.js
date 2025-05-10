'use strict'
const Sequelize = require('../../database/postgres/conexion');
const ConceptosInventariosModel = require('../../models/inventarios/_tconceptos_inventarios');
const CiaModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['coninv_nid'] > 0) && (req.body['coninv_nid'] = null);
        if (req.body['coninv_nid'] > 0) {
            const conceptoInventario = req.body;
            await ConceptosInventariosModel.update(conceptoInventario, {where: { coninv_nid: conceptoInventario.coninv_nid }, transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:conceptoInventario, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(conceptoInventario.coninv_nid, conceptoInventario.coninv_nid, '_tconceptos_inventarios', [userLog], 2, [conceptoInventario])
        } else {
            const conceptoInventario = ConceptosInventariosModel.build(req.body);
            await conceptoInventario.save({transaction: t});
            res.status(201).send({type:'success', title:'Éxito', data:conceptoInventario, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(conceptoInventario.coninv_nid, conceptoInventario.coninv_nid, '_tconceptos_inventarios', [userLog], 1, [conceptoInventario])
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
        const conceptoInventario = req.body;
        const result = await ConceptosInventariosModel.update(conceptoInventario, {where: { coninv_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tconceptos_inventarios', [userLog], 0, [conceptoInventario])
        result && res.status(201).send({type:'success', title:'Éxito', data:conceptoInventario, message:'Registro cambiado exitosamente'});
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
            await ConceptosInventariosModel.update({coninv_nsts: row.coninv_nsts}, {where: { coninv_nid: row.coninv_nid }, transaction: t});
            LogControllers.saveLog(row.coninv_nid, row.coninv_nid, '_tconceptos_inventarios', [userLog], 0, [row]);
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
        const data = await ConceptosInventariosModel.findAll({
            where:{
                cia_nid: req.body['cia_nids'],
                coninv_nsts: req.body['coninv_nsts'] ? req.body['coninv_nsts'] : 1
            },
            order:[['coninv_nid', 'DESC']],
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
    ConceptosInventariosModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
    CiaModel.hasMany(ConceptosInventariosModel,{as:'coninvs', foreignKey : 'cia_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}