import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable()
export class SkNsAdmin extends Socket {
    constructor() {
        super({ url: '/Admin', options: {transports: [ 'websocket' ]} });
    }
}
 
@Injectable()
export class SkNsCore extends Socket {
    public socketId = '';
    constructor() {
        super({ url: '/Core', options: {transports: [ 'websocket' ]} });
    }
    /**
     * Este es un metodo centralizado que se encarga de notificar los cambios en un formulario hacia todas las personas
     * de la compañía afectada, de esta manera los que sen encuentran en el formulario afectado de esa compañía, se les
     * va a refrescar la información mostrada en tiempo real.
     *  @param formulario Ruta del formulario unica que debe ser actualizado, a su vez es el nombre del evento utilizado en el backend para emitir al frontend
     *  @param cia_nid Id de la compñía afectada
     *  @param usr_nid Id del usuario que está emitiendo el evento
     *  @param notifyAll Valor booleano que establece si la notificación sera emitida a todas las compañias --> valor por defecto = false
     */
    notificarUpsert( formulario: String, cia_nid: String, usr_nid: String, notifyAll: boolean = false ) {
        this.emit('notificarUpsert', {usr_nid, formulario, cia_nid, notifyAll});
    }

    /**
     * Este método se encarga de unir al usuario en un room especificado, mas que todo se usa para unir al usuario a un room personalizado por cia y user
     *  @param roomName Nombre del room al cual necesito unir mi usuario autenticado
     *  @param cias Todas las compañías asignadas a este usuario
     */
    joinRoom( roomName: String, cias: Array<string> ) {
        this.emit('joinRoom',{roomName, cias});
    }

    /**
     * Este metodo se utiliza para desautenticar todas las sesiones abierto del usuario en diferentes dispositivos y/o pestñas del navegador
     * funciona también para todas aquellas ventanas de incognito que no comparten localstorage con las ventanas normales
     *  @param user_nid Id del usuario a desautenticar
     */
    logout( user_nid?: string ) {
        this.emit('logout', {user_nid});
    }
    /**
     * Método utilizada para emitir un evento de socket al backend y de esta manera poder gestionar la estadía en rooms
     * según el id de la compañía seleccionado en el dropdown list del sidebar
     *  @param oldCia Id de la compañía anterior para saber de que room de socket debo sacar a este usuario
     *  @param newCia Id de la compañía nueva para saber a que room de socket debo ingresar a este usuario
     *  @param cias Id de todas las compañías asignadas al usuario
     *  @param user_nid Id del usuario que esta emitiendo el evento socket
     *  @param sucu_nid Id del usuario que esta emitiendo el evento socket
     *  @param reactiveChange Valor boleano que identifica si el backend debe responder o no al evento socket emitido del frontend
     */

    interChangeCia( oldCia: string, newCia: string, cias: Array<string> = [], user_nid : number, reactiveChange: boolean = true, newCiaName: string) {
        this.emit('interchangeCia', { oldCia, newCia, cias: oldCia == 'all' ? cias : [], user_nid, reactiveChange, newCiaName });
        // newCia != 'all' && this.emit('interchangeCia', { oldCia, newCia, cias: oldCia == 'all' ? cias : [], user_nid, reactiveChange });
        // newCia == 'all' && this.emit('joinAll', {cias, user_nid, reactiveChange})
    }

    interChangeSucursal( sucu_nid: string, user_nid: any, reactiveChange: boolean = true,) {
        sucu_nid != 'all' && this.emit('interchangeSucursales', {sucu_nid, user_nid, reactiveChange });
        sucu_nid == 'all' && this.emit('joinAllSucursales', {sucu_nid, user_nid, reactiveChange})
    }
}


@Injectable({
  providedIn: 'root'
})
export class SocketsService {
  constructor() { }
}
