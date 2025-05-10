// https://openbase.io/js/socket.io-redis Link par ver eventos del socket con el adaptador redis

const _io = {"/Core":{}};

_io["/Core"]["joinRoom"] = (sk, req, io, ioCore)=>{
    if( req['cias'] && req['cias'].length>0 ){
        for (let index = 0; index < req['cias'].length; index++) {
            io.of('/Core').adapter.remoteJoin(sk.id, 'cia'+req['cias'][index],(err) => {
                if(err){
                    console.log('Error uniendo room remoto:', err);
                }
            });
        }
    }else{
        io.of('/Core').adapter.remoteJoin(sk.id, req['roomName'],(err) => {
            if(err){
                console.log('Error uniendo room remoto:', err);
            }
        });
    }
    io.of('/Core').to(req['roomName']).emit('joined', 'unido al room: '+req['roomName']);
}
_io["/Core"]["notificarUpsert"] = (sk, req, io, ioCore)=>{
    if  (req['notifyAll']){
        io.of('/Core').emit(`${req.formulario}`, sk.id.toString());
    }else{
        io.of('/Core').to('cia'+req['cia_nid']).emit(`${req.formulario}+${req.cia_nid}`, sk.id.toString());
    }
}
_io["/Core"]["logout"] = (sk, req, io, ioCore)=>{
    io.of('/Core').to('usr'+req['user_nid']).emit('logout'+req['user_nid'], 'Logout (NS: Core ROOMUSU)');
}
_io["/Core"]["newLogin"] = (sk, req, io, ioCore)=>{
    io.of('/Core').to('usr'+req['user_nid']).emit('logoutnewlogin'+req['user_nid'], req['dateTimeNumber']);
}
_io["/Core"]["interchangeCia"] = (sk, req, io, ioCore)=>{
    if( req['cias'] && req['cias'].length>0 ) {
        for (let index = 0; index < req['cias'].length; index++) {
            if( req['newCia'] != req['cias'][index] ){
                io.of('/Core').adapter.remoteLeave(sk.id, 'cia'+req['cias'][index],(err) => {
                    if(err){
                        console.log('Error dejando room remoto:', err);
                    }
                });
            }
        }
    }else{
        if( req['newCia'] == req['oldCia'] && !req['reactiveChange'] ){
            io.of('/Core').adapter.remoteJoin(sk.id, 'cia'+req['newCia'],(err) => {
                if(err){
                    console.log('Error uniendo room remoto:', err);
                }
            });
        }else{
            io.of('/Core').adapter.remoteLeave(sk.id, 'cia'+req['oldCia'],(err) => {
                if(err){
                    console.log('Error dejando room remoto:', err);
                }
            });
            io.of('/Core').adapter.remoteJoin(sk.id, 'cia'+req['newCia'],(err) => {
                if(err){
                    console.log('Error uniendo room remoto:', err);
                }
            });
        }
    }
    if( req['reactiveChange'] ){
        io.of('/Core').to('usr'+req['user_nid']).emit('ciaChanged'+req['user_nid'], { newCia: req['newCia'], newSucursal: req['sucu_nid'],  newCiaName: req['newCiaName']});
    }
}
_io["/Core"]["joinAll"] = (sk, req, io, ioCore)=>{
    for (let index = 0; index < req['cias'].length; index++) {
        io.of('/Core').adapter.remoteJoin(sk.id, 'cia'+req['cias'][index],(err) => {
            if(err){
                console.log('Error uniendo room remoto:', err);
            }
        });
    }
    if( req['reactiveChange'] ){
        io.of('/Core').to('usr'+req['user_nid']).emit('ciaChanged'+req['user_nid'], { newCia: 'all', newCias: req['cias'], newCiaName: req['newCiaName']});
    }
}

_io["/Core"]["interchangeSucursales"] = (sk, req, io, ioCore)=>{
    if( req['reactiveChange'] ){
        io.of('/Core').to('usr'+req['user_nid']).emit('sucursalChanged'+req['user_nid'], { newSucursal: req['sucu_nid'] });
    }
}

_io["/Core"]["joinAllSucursales"] = (sk, req, io, ioCore)=>{
    if( req['reactiveChange'] ){
        io.of('/Core').to('usr'+req['user_nid']).emit('sucursalChanged'+req['user_nid'], { newSucursal: 'all' });
    }
}

_io["/Core"]["interchangeFormato"] = (sk, req, io, ioCore)=>{
    if( req['reactiveChange'] ){
        io.of('/Core').to('usr'+req['user_nid']).emit('formatoChanged'+req['user_nid'], { newFormato: req['forimp_nid'] });
    }
}

module.exports = _io;