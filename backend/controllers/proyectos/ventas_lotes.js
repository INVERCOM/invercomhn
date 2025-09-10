const Sequelize = require('../../database/postgres/conexion');
const VentasLotesModel = require('../../models/proyectos/_tventas_lotes');
const LotesModel = require('../../models/proyectos/_tlotes');
const ClientesModel = require('../../models/ventas/_tclientes');
const ProyectosModel = require('../../models/proyectos/_tproyectos');
const logsController = require('../logs/logs');

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        if (req.body['venlot'] > 0) {
            const ventaLote = req.body;
            const result = await VentasLotesModel.update(ventaLote, {where: { venlot: ventaLote.venlot }, transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:ventaLote, message:'Registro actualizado exitosamente'});
            logsController.saveLog(userLog['cia_nid'], ventaLote.venlot, '_tventas_lotes', [userLog], 2, [ventaLote]);

        } else {
            const ventaLote = VentasLotesModel.build(req.body);
            const result = await ventaLote.save({transaction: t});
            result && res.status(201).send({type:'success', title:'Éxito', data:ventaLote, message:'Registro guardado exitosamente'});
            logsController.saveLog(userLog['cia_nid'], ventaLote.venlot, '_tventas_lotes', [userLog], 1, [ventaLote]);
        }
        await t.commit();
    } catch (error) {
        await t.rollback();
       global._globalDebug && console.log( `Error`, error );
        res.status(500).send({type:'error', title:'create.toast.title_error' , message:'create.toast.srverror'});
    }
}

async function setSts( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];

    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        const ventaLote = req.body;
        const result = await VentasLotesModel.update({'venlot_nsts': ventaLote['venlot_nsts'] }, {where: { venlot: id },  logging: function (str) { sql = str} });
        logsController.saveLog(userLog['cia_nid'], id, '_tventas_lotes', [userLog], 0, [ventaLote])
        result && res.status(201).send({type:'success', title:'Éxito', data:ventaLote, message:'Registro cambiado exitosamente'});
        await t.commit();
    } catch (error) {
        await t.rollback();
       global._globalDebug && console.log( `Error`, error );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

async function getAll( req, res ) {
    try {
        const data = await VentasLotesModel.findAll({ 
                where:{
                    venlot_nsts: req.body['venlot_nsts'] ? req.body['venlot_nsts'] : 1 
                },
                order: [ ['venlot_nid', 'DESC'], ],
                include: [{
                    model:LotesModel,
                    as:'_tlotes',
                    required: true
                },{
                    model:ClientesModel,
                    where:{ cia_nid: req.body['cia_nids'] },
                    as:'_tclis',
                    required: true
                }] 
        });
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
       global._globalDebug && console.log( `Error`, error );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});   
    }
}

async function getAllBySucursal( req, res ) {
    try {
        const data = await VentasLotesModel.findAll({ 
                where:{
                    venlot_nsts: req.body['venlot_nsts'] ? req.body['venlot_nsts'] : 1 
                },
                order: [ ['venlot_nid', 'DESC'], ],
                include: [{
                    model:LotesModel,
                    as:'_tlotes',
                    required: true,
                    include: [{
                        model:ProyectosModel,
                        where:{ sucu_nid: req.body['sucu_nids'] },
                        as:'_tproyectos',
                        required: true
                    }]
                },{
                    model:ClientesModel,
                    as:'_tclis',
                    required: true
                }] 
        });
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
       global._globalDebug && console.log( `Error`, error );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});   
    }
}

function definirRelaciones() {
    VentasLotesModel.belongsTo(LotesModel,{as:'_tlotes', foreignKey: 'lote_nid'});
    LotesModel.hasMany(VentasLotesModel,{as:'_tvenlots', foreignKey : 'lote_nid'});

    VentasLotesModel.belongsTo(ClientesModel,{as:'_tclis', foreignKey: 'cli_nid'});
    ClientesModel.hasMany(VentasLotesModel,{as:'_tvenlots', foreignKey : 'cli_nid'});
}

definirRelaciones();

module.exports = {
    save,
    setSts,
    getAll,
    getAllBySucursal,
}