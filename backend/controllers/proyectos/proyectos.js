const Sequelize = require('../../database/postgres/conexion');
const Proyectos = require('../../models/proyectos/_tproyectos');
const Sucursales = require('../../models/admin/_tsucursales');
const FTPController = require('../FTP/ftpcontroller');
const logsController = require('../logs/logs');

async function createProyecto( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const img = req.body['img'];
    delete req.body['img'];
    const t = await Sequelize.transaction();
    try {
        if (req.body['proy_nid'] > 0) {
            const proyecto = req.body;
            const result = await Proyectos.update(proyecto, {where: { proy_nid: proyecto.proy_nid }, transaction: t});
            img && await FTPController.uploadFile('/proyectos-'+proyecto['proy_nid'] + '.jpg', img);
            result && res.status(201).send({type:'success', title:'Éxito', data:proyecto, message:'Registro actualizado exitosamente'});
            logsController.saveLog(proyecto.proy_nid, proyecto.proy_nid, '_tproyectos', [userLog], 2, [proyecto]);
        } else {
            const proyecto = Proyectos.build(req.body);
            const result = await proyecto.save({transaction: t});
            img && await FTPController.uploadFile('/proyectos-'+proyecto['proy_nid'] + '.jpg', img);
            result && res.status(201).send({type:'success', title:'Éxito', data:proyecto, message:'Registro guardado exitosamente'});
            logsController.saveLog(proyecto.proy_nid, proyecto.proy_nid, '_tproyectos', [userLog], 1, [proyecto]);
        }
        await t.commit();
    } catch (error) {
        await t.rollback();
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'create.toast.title_error' , message:'create.toast.srverror'});
    }
}

async function setSts( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];

    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        const proyecto = req.body;
        const result = await Proyectos.update({'proy_nsts': proyecto['proy_nsts'] }, {where: { proy_nid: id },  logging: function (str) { sql = str} });
        logsController.saveLog(id, id, '_tproyectos', [userLog], 0, [proyecto])
        result && res.status(201).send({type:'success', title:'Éxito', data:proyecto, message:'Registro cambiado exitosamente'});
        await t.commit();
    } catch (error) {
        await t.rollback();
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'update.toast.title_error' , message:'update.toast.srverror'});
    }
}

async function getAll( req, res ) {
    try {
        const data = await Proyectos.findAll({ 
                where:{
                    sucu_nid: req.body['sucu_nids'],
                    proy_nsts: req.body['proy_nsts'] ? req.body['proy_nsts'] : 1,
                },
                order: [ ['proy_nid', 'DESC'] ],
                as:'_tproyectos',
                include: [{
                    model:Sucursales,
                    as:'_tsucursales'
                }
            ]
        });
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'update.toast.title_error' , message:'update.toast.srverror'});   
    }
}

async function getAllForClients( req, res ) {
    try {
        const data = await Proyectos.findAll({ 
            where:{
                proy_nsts: 1,
            },
            order: [
                ['proy_nid', 'DESC'],
            ],
            as:'_tproyectos',
        });
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        global._globalDebug && console.log( `Error ${error}` );
        res.status(500).send({type:'error', title:'update.toast.title_error' , message:'update.toast.srverror'});   
    }
}

async function getImg( req, res ){
    try {
        const img = await FTPController.downloadFile('/proyectos-'+ req.body['proy_nid'] + '.jpg');
        res.status(200).json(img);
    } catch (error) {
        res.status(500).send({type:'error', title:'create.toast.title_error' , message:'create.toast.srverror'})
    }
}

function definirRelacionesProyectos() {
    Proyectos.belongsTo(Sucursales,{as:'_tsucursales', foreignKey: 'sucu_nid'});
    Sucursales.hasMany(Proyectos,{as:'_tproyectos', foreignKey : 'sucu_nid'});
}

definirRelacionesProyectos();

module.exports = {
    createProyecto,
    getAll,
    getAllForClients,
    setSts,
    getImg
}