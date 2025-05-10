'use strict'
const Monedas = require('../../models/admin/_tmonedas');

async function create( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        let sql ='', log_vquery = ''; !(req.body['mone_nid'] > 0) && (req.body['mone_nid'] = null);
        const moneda = Monedas.build(req.body);
        const result = await moneda.save({ logging: function (str) { sql = str} });

        if (result) {
            res.status(201).send({type:'success', title:'create.toast.title_saved', data:moneda, message:'create.toast.saved'}); 
            log_vquery = sql + ' | ' + Object.values(moneda['dataValues']);
            // await logsController.createLog('_tmonedas', moneda.mone_nid, userLog['user_nid'], 1, 1, 1, log_vquery, userLog['plata_name']);
        }
        await t.commit();

    } catch (error) {
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

async function update( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];

    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        const moneda = req.body;
        let sql ='', log_vquery = '', fechaLog = '';

        const result = await Monedas.update(moneda, {where: { mone_nid: id }, logging: function (str) { sql = str} });
        if (result) {
            log_vquery = sql + ' | ' + Object.values(cia);
            // fechaLog = await logsController.createLog('_tmonedas', moneda.mone_nid, userLog['user_nid'], 2, 1, 1, log_vquery, userLog['plata_name']);
            res.status(201).send({type:'success', title:'update.toast.title_updated', data:moneda, message:'update.toast.updated'});
        }
        await t.commit();
        
    } catch (error) {
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

async function getAll( req, res ) {
    try {
        const data = await Monedas.findAll();
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});   
    }
}

module.exports = {
    create,
    update,
    getAll
}