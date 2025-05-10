const io          = require('socket.io')()
const ioCore      = io.of('/Core')
const IOPlugs   = require('./io/index')

try{
    ioCore.use((sk, n) => {
        executeSocket( sk, n );
	});
}catch(err){
    console.log(err);	
}

function executeSocket( sk, n) {
    sk.use((packet, next) => {
        if ( IOPlugs && sk ) {
            IOPlugs[sk.nsp.name][packet[0]](sk, packet[1], io, ioCore)
        }
        next();
    });
    n();
}
module.exports=io;