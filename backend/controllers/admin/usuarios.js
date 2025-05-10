'use strict'
const { Op }                   =   require('sequelize');
const Sequelize                =   require('../../database/postgres/conexion');
const bcrypt                   =   require('bcryptjs');
const UsuariosModel            =   require('../../models/admin/_tusuarios');
const UsuariosSucursalModel        =   require('../../models/admin/_tasig_sucursal_user');
const UsuariosCiasModel        =   require('../../models/admin/_tasig_user_cia');
const UsuariosAccesosModel     =   require('../../models/admin/_tasig_user_accesos');
const AccesosModel             =   require('../../models/admin/_taccesos');
const CompaniaModel            =   require('../../models/admin/_tcias');
const SucursalModel            =   require('../../models/admin/_tsucursales');
const jwt                      =   require('jsonwebtoken');
const fs                       =   require('fs');
const cert_pub                 =   fs.readFileSync(__dirname + '/../../public_key.pem',{encoding: 'utf-8'});
const cert_priv                =   fs.readFileSync(__dirname + '/../../private_key.pem',{encoding: 'utf-8'});
const LogControllers           =   require('../logs/logs')

function getToken(req, res) {
    try {
        const { username, email, pwd } = req.body;
        const token = jwt.sign({ username, email, pwd }, cert_priv, { algorithm: 'RS256', expiresIn: '1h' });
        res.status(200).send({ type: 'ok', message: 'Token obtenido', token });
    } catch (error) {
        global._globalDebug && console.log(`Error ${error}`);
    }
}

function verifyToken(req, res) {
    if (req && req.headers && req.headers.authorization && req.headers.authorization != null && req.headers.authorization != '' && req.headers.authorization.split('.').length === 3) {
        try {
            const token = req.headers.authorization;
            const user = jwt.verify(token, cert_pub, { algorithms: ['RS256'], expiresIn : '1h' });
            const decodedToken = verify(token);
            let newToken = token;
            newToken = sign({ user_nid: decodedToken.user_nid, cia_nid: decodedToken.cia_nid, user_vmail: decodedToken.user_vmail, sucursales: decodedToken.sucursales, cias: decodedToken.cias, accesos:decodedToken.accesos, expiresIn : decodedToken.expiresIn}, decodedToken.expiresIn);
            res.status(200).send({ type: 'ok', message: 'Token verificado', user, newToken, accesos:decodedToken.accesos });
        } catch (error) {
            let status = 500;
            let message = error.message;
            if (error && error.message && error.message == 'jwt expired') {
                status = 401
                message = 'login.toast.jwt_expire_message';
            }
            console.log('Error verificando token', 'Error controlado', error.message, ' || ', JSON.stringify(error));
            res.status(status).send({ type: 'warning', message, title: 'login.toast.warning' });
        }
    } else {
       
        let message = 'login.toast.forbiden_message';
        let status = 400;
        res.status(status).send({ type: 'warning', message, title: 'login.toast.warning' });
    }
}

function sign( payload, expiresIn ) {
    return jwt.sign( payload, cert_priv, { algorithm: 'RS256', expiresIn } );
}

function verify( token ) {
    return  jwt.verify(token, cert_pub, {algorithms:['RS256']});
}

async function login( req, res ) {
    let cias= [], accesos=[], sucursales = [];
    let data; let tipoMessaje = 'error'; let title = 'login.toast.error';
    try {
        data = await UsuariosModel.findOne({ 
            where:{ user_vmail: req.body['user_vmail'] },
            include:[{
                    model: SucursalModel,
                    attributes:['sucu_nid', 'sucu_vnombre', 'cia_nid'],
                    where: { sucu_nsts: [1] },
                    as: '_tsucursales',
                    required : false
                },{
                    model: CompaniaModel,
                    attributes:['cia_nid', 'cia_vnombre'],
                    where: { cia_nsts: [1] },
                    as: '_tcias',
                    required : false
                },{
                    model: AccesosModel,
                    attributes:['acce_vclave'],
                    where: { acce_nsts: [1] },
                    as: '_taccesos',
                    required : false
                }]
        });
        data!=null && (data = data.toJSON());
        if( (data && data['user_vpass'] && bcrypt.compareSync(req.body['user_vpass'], data['user_vpass']) && data['user_nsts'] > 0)){
            delete data['user_vpass'];
            if( data['_tcias'] && data['_tcias'].length && data['_tcias'].length > 0 ){
                for ( let i = 0; i < data['_tcias'].length; i++ ) {
                    const row = data['_tcias'][i]
                    cias.push({cia_nid: row['cia_nid'], cia_vnombre: row['cia_vnombre']});
                }
            } else {
                tipoMessaje = 'warn'; title = 'login.toast.warning';
                throw new Error('El usuario no tiene compañía asignada');
            }
            if( data['_tsucursales'] && data['_tsucursales'].length && data['_tsucursales'].length > 0 ){
                for ( let i = 0; i < data['_tsucursales'].length; i++ ) {
                    const row = data['_tsucursales'][i]
                    sucursales.push({sucu_nid: row['sucu_nid'], sucu_vnombre: row['sucu_vnombre'], cia_nid: row['cia_nid']});
                }
            } else {
                tipoMessaje = 'warn'; title = 'login.toast.warning';
                throw new Error('El usuario no tiene sucursall asignada');
            }
            if( data['_taccesos'] && data['_taccesos'].length && data['_taccesos'].length > 0 ){
                for ( let i = 0; i < data['_taccesos'].length; i++ ) {
                    const row = data['_taccesos'][i]
                    accesos.push(row['acce_vclave']);
                }
            } else {
                tipoMessaje = 'warn'; title = 'login.toast.warning';
                throw new Error('El usuario no tiene accesos asignada');
            }
        }else if (data && data['user_nsts'] < 1) {
            tipoMessaje = 'warn'; title = 'login.toast.warning';
            throw new Error('El usuario esta inactivado');
        } else{
            if (data && data['user_vmail']) {
                tipoMessaje = 'warn'; title = 'login.toast.warning';
                throw new Error('Credenciales invalidas');
            } else {
                tipoMessaje = 'warn'; title = 'login.toast.warning';
                throw new Error('El usuario no existe');
            }
        }
    } catch (error) {
        let message = error.message;
        // global._globalDebug && console.log('Error logueando usuario:', JSON.stringify(error), 'Error Controlado', error.message, ' | ', message);
        global._globalDebug && console.log(global.FgRed, `Error login usuario ${error.message}`, );
        message == 'Credenciales invalidas';
        const type = tipoMessaje;
        return res.status(500).send({type, title , message});
    }
    
    if( Object.keys(data).length !== 0 ){
        const token = sign( {user_nid: data['user_nid'], user_vmail: data['user_vmail'], cias, sucursales, accesos, expiresIn : data['user_vtiemposesion']}, data['user_vtiemposesion']);
        data['token'] = token;
        data['_taccesos'] = accesos;
        data['_tsucursales'] = sucursales;

    }
    res.json( {type:'success', title:'login.toast.success' , message:'login.toast.logged_message', data} );
}

async function changePassAuth( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const usuario = req.body;
        const data = await UsuariosModel.findOne({ where:{ user_vmail: usuario['user_vmail'] }});
        if( (data && data['user_vpass'] && bcrypt.compareSync(usuario['user_vpassactual'], data['user_vpass']) && data['user_nsts'] > 0)){
            const newPass = bcrypt.hashSync(usuario['user_vpassnueva'], bcrypt.genSaltSync(10));
            const result = await UsuariosModel.update({user_vpass: newPass, user_nsts: 1}, {where: { user_nid: data['user_nid'] }, transaction: t });
            LogControllers.saveLog(0, data['user_nid'], '_tusuarios', [userLog], 5, [usuario])
            result && res.status(201).send({type:'success', title:'Éxito', data:{}, message:'Contraseña cambiada exitosamente!'});
        } else {
            const message = (data && data['user_nid'] > 0 ? `Contraseña actual incorrecta!` : `Usuario inexistente, revise su correo!`)
            global._globalDebug && console.log(global.FgRed, `Error: ${message}` );
            res.status(200).send({type:'warn', title:'Alerta', message});
        }
        await t.commit();
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error: ${error}` );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

async function save( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        !(req.body['user_nid'] > 0) && (req.body['user_nid'] = null);
        if (req.body['user_nid'] > 0) {
            delete req.body.user_vpass
            const usuario = req.body;
            const result = await UsuariosModel.update(usuario, {where: { user_nid: usuario.user_nid }, transaction: t});
            LogControllers.saveLog(0, usuario.user_nid, '_tusuarios', [userLog], 2, [usuario])
            result && res.status(201).send({type:'success', title:'Éxito', data:usuario, message:'Registro actualizado exitosamente'});
        } else {
            req.body.user_vpass = Math.floor(Math.random() * (99999 - 10000) + 10000).toString();
            req.body.user_vpass = bcrypt.hashSync(req.body.user_vpass, bcrypt.genSaltSync(10));
            const usuario = UsuariosModel.build(req.body);
            const result = await usuario.save({transaction: t});
            LogControllers.saveLog(0, usuario.user_nid, '_tusuarios', [userLog], 1, [usuario])
            result && res.status(201).send({type:'success', title:'Éxito', data:usuario, message:'Registro guardado exitosamente'});
        }
        await t.commit();

    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        if(error['message'] === 'unique_user_vmail_error'){
            res.status(200).send({type:'warn', title:'Alerta' , message:'El correo electrónico ya esta registrado en el sistema'})
        }else {
            res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        }
        await t.rollback();
    }
}

async function setSts( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        const usuario = req.body;
        const result = await UsuariosModel.update(usuario, {where: { user_nid: id }, transaction: t });
        result && res.status(201).send({type:'success', title:'Éxito', data:usuario, message:'Registro cambiado exitosamente'});
        LogControllers.saveLog(0, id, '_tusuarios', [userLog], 0, [usuario])
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
            await UsuariosModel.update({user_nsts: row.user_nsts}, {where: { user_nid: row.user_nid }, transaction: t});
            LogControllers.saveLog(0, row.user_nid, '_tusuarios', [userLog], 0, [row])
        }
        res.status(201).send({type:'success', title:'Éxito', message:'Registros cambiado exitosamente'});
        await t.commit();
        
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

async function getAll( req, res ) {
    try {
        const data = await UsuariosModel.findAll({
            where:{user_nsts: req.body['user_nsts'] ? req.body['user_nsts'] : 1},
            order:[['user_nid', 'DESC']]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

async function getAllByCia( req, res ) {
    try {
        const data = await UsuariosModel.findAll({
            where:{user_nsts: req.body['user_nsts'] ? req.body['user_nsts'] : 1},
            order:[['user_nid', 'DESC']],
            include:[{
                model: CompaniaModel,
                attributes:['cia_nid', 'cia_vnombre'],
                where: {cia_nid: req.body['cia_nids'] },
                as: '_tcias',
                required : true
            }]
        });
        res.status(200).json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

async function changePass( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        const user = req.body;
        user['user_vpass'] = bcrypt.hashSync(user['user_vpass'], bcrypt.genSaltSync(10));
        user['user_nsts'] = req.body['user_nsts'] ? req.body['user_nsts'] : 2;
        const result = await UsuariosModel.update(user, {where: { user_nid: id }, transaction: t});
        LogControllers.saveLog(0, id, '_tusuarios', [userLog], 5.2, [user])
        result && res.status(201).send({type:'success', title:'Éxito', message:'Contraseña cambiada de forma exitosa'});
        await t.commit();
    } catch (error) {
        await t.rollback();
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});  
    }
}

async function getUsuariosCias( req, res ) {
    try {
        const {id} = req.params;
        const data = await UsuariosCiasModel.findAll({ 
            where:{ user_nid: id },
        });
        res.json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

async function saveUsuariosCias( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        await UsuariosCiasModel.destroy({ where:{ user_nid: id } });
        await UsuariosCiasModel.bulkCreate(req.body['asig']);
        LogControllers.saveLog(0, id, '_tasig_user_cia', [userLog], 4, req.body['asig']);
        res.status(201).send({type:'success', title:'Éxito', data:req.body, message:'Registro guardado exitosamente'});
        await t.commit();
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

async function getUsuariosAccesos( req, res ) {
    try {
        const {id} = req.params;
        const data = await UsuariosAccesosModel.findAll({ 
            where:{ user_nid: id },
        });
        res.json(data);
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
    }
}

async function saveUsuariosAccesos( req, res ) {
    const userLog = req.body['_tp_tusuarioLog'];
    delete req.body['_tp_tusuarioLog'];
    const t = await Sequelize.transaction();
    try {
        const {id} = req.params;
        await UsuariosAccesosModel.destroy({ where:{ user_nid: id } });
        await UsuariosAccesosModel.bulkCreate(req.body['asig']);
        LogControllers.saveLog(0, id, '_tasig_user_accesos', [userLog], 4, req.body['asig']);
        res.status(201).send({type:'success', title:'Éxito', data:req.body, message:'Registro guardado exitosamente'});
        await t.commit();
    } catch (error) {
        global._globalDebug && console.log(global.FgRed, `Error ${error}`, );
        res.status(500).send({type:'error', title:'Error', message: error?.toString()});
        await t.rollback();
    }
}

function definirRelacionesUsuario() {
    UsuariosSucursalModel.belongsTo( UsuariosModel, { foreignKey: 'user_nid' } );
    UsuariosSucursalModel.belongsTo( SucursalModel, { foreignKey: 'sucu_nid' } );

    UsuariosModel.belongsToMany( SucursalModel, { as: '_tsucursales', through:  UsuariosSucursalModel, foreignKey: 'user_nid', otherKey: 'sucu_nid' } );
    SucursalModel.belongsToMany( UsuariosModel, { through: UsuariosSucursalModel, foreignKey: 'sucu_nid', otherKey: 'user_nid' });

    UsuariosCiasModel.belongsTo( UsuariosModel, { foreignKey: 'user_nid' } );
    UsuariosCiasModel.belongsTo( CompaniaModel, { foreignKey: 'cia_nid' } );

    UsuariosModel.belongsToMany( CompaniaModel, { as: '_tcias', through:  UsuariosCiasModel, foreignKey: 'user_nid', otherKey: 'cia_nid' } );
    CompaniaModel.belongsToMany( UsuariosModel, { through: UsuariosCiasModel, foreignKey: 'cia_nid', otherKey: 'user_nid' });

    UsuariosAccesosModel.belongsTo( UsuariosModel, { foreignKey: 'user_nid' } );
    UsuariosAccesosModel.belongsTo( AccesosModel, { foreignKey: 'acce_nid' } );

    UsuariosModel.belongsToMany( AccesosModel, { as: '_taccesos', through:  UsuariosAccesosModel, foreignKey: 'user_nid', otherKey: 'acce_nid' } );
    AccesosModel.belongsToMany( UsuariosModel, { through: UsuariosAccesosModel, foreignKey: 'acce_nid', otherKey: 'user_nid' });
}

definirRelacionesUsuario();

module.exports = {
    getToken,
    verifyToken,
    login,
    save,
    setSts,
    setBulkSts,
    getAll,
    getAllByCia,
    changePass,
    changePassAuth,
    getUsuariosCias,
    saveUsuariosCias,
    getUsuariosAccesos,
    saveUsuariosAccesos
}