'use strict'
const Sequelize = require('../../database/postgres/conexion');
const MaterialModel = require('../../models/inventarios/_tmateriales');
const ImpuestoModel = require('../../models/inventarios/_timpuestos');
const MaterialesImpuestosModel = require('../../models/inventarios/_tasig_materiales_impuestos');
const CiaModel = require('../../models/admin/_tcias');
const LogControllers = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    // const impuestos = req.body['_isvs'];
    // delete req.body['_isvs'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['mater_nid'] > 0) && (req.body['mater_nid'] = null);
        if (req.body['mater_nid'] > 0) {
            const material = req.body;
            await MaterialModel.update(material, {where: { mater_nid: material.mater_nid }, transaction: t});
            // await MaterialesImpuestosModel.destroy({ where:{ mater_nid: material.mater_nid }, transaction: t});
            // await MaterialesImpuestosModel.bulkCreate(impuestos, {transaction: t}); 
            
            res.status(201).send({type:'success', title:'Éxito', data:material, message:'Registro actualizado exitosamente'});
            LogControllers.saveLog(material.mater_nid, material.mater_nid, '_tmateriales', [userLog], 2, [material])
        } else {
            const material = MaterialModel.build(req.body);
            await material.save({transaction: t});
            // for (let i = 0; i < impuestos.length; i++) { impuestos[i]['mater_nid'] = material.mater_nid; }
            // await MaterialesImpuestosModel.destroy({ where:{ mater_nid: material.mater_nid }, transaction: t });
            // await MaterialesImpuestosModel.bulkCreate(impuestos, {transaction: t});
            
            res.status(201).send({type:'success', title:'Éxito', data:material, message:'Registro guardado exitosamente'});
            LogControllers.saveLog(material.mater_nid, material.mater_nid, '_tmateriales', [userLog], 1, [material])
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
        const material = req.body;
        const result = await MaterialModel.update(material, {where: { mater_nid: id }, transaction: t });
        LogControllers.saveLog(id, id, '_tmateriales', [userLog], 0, [material])
        result && res.status(201).send({type:'success', title:'Éxito', data:material, message:'Registro cambiado exitosamente'});
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
            await MaterialModel.update({mater_nsts: row.mater_nsts}, {where: { mater_nid: row.mater_nid }, transaction: t});
            LogControllers.saveLog(row.mater_nid, row.mater_nid, '_tmateriales', [userLog], 0, [row]);
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
        const data = await MaterialModel.findAll({
            where:{
                cia_nid: req.body['cia_nids'],
                mater_nsts: req.body['mater_nsts'] ? req.body['mater_nsts'] : 1
            },
            order:[['mater_nid', 'DESC']],
            include:[{
                model: CiaModel,
                as: 'cias'
            },{
                model: ImpuestoModel,
                as: 'isvs'
            }]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

function definirRelaciones() {
    MaterialModel.belongsTo(CiaModel,{as:'cias', foreignKey: 'cia_nid'});
    CiaModel.hasMany(MaterialModel,{as:'maters', foreignKey : 'cia_nid'});

    MaterialesImpuestosModel.belongsTo( MaterialModel, { foreignKey: 'mater_nid' } );
    MaterialesImpuestosModel.belongsTo( ImpuestoModel, { foreignKey: 'isv_nid' } );

    MaterialModel.belongsToMany( ImpuestoModel, { as: 'isvs', through:  MaterialesImpuestosModel, foreignKey: 'mater_nid', otherKey: 'isv_nid' } );
    ImpuestoModel.belongsToMany( MaterialModel, { as: 'maters', through: MaterialesImpuestosModel, foreignKey: 'isv_nid', otherKey: 'mater_nid' });
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    setBulkSts,
    getAll
}