const { Op, QueryTypes } = require('sequelize');
const Sequelize = require('../../database/postgres/conexion');
const PagosLotesModel = require('../../models/proyectos/_tpagos_lotes');
const SucursalesModel = require('../../models/admin/_tsucursales');
const LotesModel = require('../../models/proyectos/_tlotes');
const ClientesModel = require('../../models/ventas/_tclientes');
const VentasLotesModel = require('../../models/proyectos/_tventas_lotes');
const MonedasModel = require('../../models/admin/_tmonedas');
const logsController = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        if (req.body['paglot_nid'] > 0) {
            const lote = req.body;
            const result = await PagosLotesModel.update(lote, {where: { paglot_nid: lote.paglot_nid }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:lote, message:'Registro actualizado exitosamente'});
            logsController.saveLog(lote.paglot_nid, lote.paglot_nid, '_tpagos_lotes', [userLog], 2, [lote]);

        } else {
            const lote = PagosLotesModel.build(req.body);
            const result = await lote.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:lote, message:'Registro guardado exitosamente'});
            logsController.saveLog(lote.paglot_nid, lote.paglot_nid, '_tpagos_lotes', [userLog], 1, [lote]);
        }
        await t.commit();
    } catch (error) {
        await t.rollback();
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

async function setSts( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        const lote = req.body;
        const result = await PagosLotesModel.update({'paglot_nsts': lote['paglot_nsts'] }, {where: { paglot_nid: id },  logging: function (str) { sql = str} });
        logsController.saveLog(id, id, '_tpagos_lotes', [userLog], 0, [lote])
        result && res.status(201).send({type:'success', title:'Éxito', data:lote, message:'Registro cambiado exitosamente'});
        await t.commit();
    } catch (error) {
        await t.rollback();
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

async function getAll( req, res ) {
    try {
        const data = await PagosLotesModel.findAll({ 
                where:{
                    sucu_nid: req.body['sucu_nids'] ? req.body['sucu_nids'] : [0],
                    paglot_nsts: req.body['paglot_nsts'] ? req.body['paglot_nsts'] : [1]
                },
                order: [ ['paglot_nid', 'DESC'] ],
                as:'_tpagos_lotes',
                include: [{
                    model:SucursalesModel,
                    as:'_tsucus',
                    required: true,
                },{
                    model:VentasLotesModel,
                    as:'_tvenlots',
                    required: true,
                    include:[{
                        model:LotesModel,
                        as:'_tlotes',
                        required: true,
                    },{
                        model:ClientesModel,
                        as:'_tclis',
                        required: true
                    }]
                },{
                    model:MonedasModel,
                    as:'_tmones',
                    required: true,
                }
            ] 
        });
        res.status(200).json(data);

    } catch (error) {
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

async function getAllByVentaLotes( req, res ) {
    try {
        const data = await PagosLotesModel.findAll({ 
                where:{
                    venlot_nid: req.body['venlot_nid'] ? req.body['venlot_nid'] : [0],
                    paglot_nsts: req.body['paglot_nsts'] ? req.body['paglot_nsts'] : [1]
                },
                order: [ ['paglot_nid', 'DESC'] ],
                as:'_tpagos_lotes',
                include: [{
                    model:SucursalesModel,
                    as:'_tsucus',
                    required: true,
                },{
                    model:VentasLotesModel,
                    as:'_tvenlots',
                    required: true,
                    include:[{
                        model:LotesModel,
                        as:'_tlotes',
                        required: true,
                    },{
                        model:ClientesModel,
                        as:'_tclis',
                        required: true
                    }]
                },{
                    model:MonedasModel,
                    as:'_tmones',
                    required: true,
                }
            ] 
        });
        res.status(200).json(data);

    } catch (error) {
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

async function getSaldoActualVentaLote( req, res ) {
    try {
        const query = `SELECT (
                            (SELECT COALESCE(venlot_fvalorfinal, 0) 
                            FROM proyectos."_tventas_lotes" 
                            WHERE venlot_nid = ${req.body.venlot_nid})
                            -
                            (SELECT COALESCE(SUM(paglot_fimporte), 0) 
                            FROM proyectos."_tpagos_lotes" 
                            WHERE venlot_nid = ${req.body.venlot_nid} 
                                AND paglot_dfecha < '${req.body.paglot_dfecha}'
                                AND paglot_nsts = 1)
                        ) AS saldoActual;`;
        const data = await Sequelize.query(query, {
            type: QueryTypes.SELECT,
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

function definirRelaciones() {
    PagosLotesModel.belongsTo(SucursalesModel,{as:'_tsucus', foreignKey: 'venlot_nid'});  
    SucursalesModel.hasMany(PagosLotesModel,{as:'_tpaglots', foreignKey : 'venlot_nid'});

    PagosLotesModel.belongsTo(VentasLotesModel,{as:'_tvenlots', foreignKey: 'venlot_nid'});  
    VentasLotesModel.hasMany(PagosLotesModel,{as:'_tpaglots', foreignKey : 'venlot_nid'});

    PagosLotesModel.belongsTo(MonedasModel,{as:'_tmones', foreignKey: 'mone_nid'});  
    MonedasModel.hasMany(PagosLotesModel,{as:'_tpaglots', foreignKey : 'mone_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    getAll,
    getAllByVentaLotes,
    getSaldoActualVentaLote
}