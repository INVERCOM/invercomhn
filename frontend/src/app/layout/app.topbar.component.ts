import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { SkNsCore } from '../shared/services/sockets.service';
import { AuthService } from '../shared/services/auth.service';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    items!: MenuItem[];
    private $destroy: Subject<void> = new Subject();
    private tokenDecifrado;
    public ciaName: string | null;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService, public authS:AuthService, public skNsCore: SkNsCore) { 
        this.ciaName = localStorage.getItem('ciaName')
        this.tokenDecifrado = this.authS.parseJwt(localStorage.getItem('jwt')!);
        this.skNsCore.on('connect', (x: any)=> {
            this.skNsCore.socketId = this.skNsCore.ioSocket.id
            this.skNsCore.joinRoom( 'cia'+localStorage.getItem('cia'), this.authS.isValidCia(false) );
            this.skNsCore.joinRoom( 'usr'+this.tokenDecifrado.user_nid, [] );
            console.log("Conectado", x);
        });
        this.skNsCore.fromEvent('logout'+this.tokenDecifrado.user_nid).pipe(take(1)).subscribe((x)=>{
            this.authS.logOut()
        });
        this.skNsCore.fromEvent('joined').pipe(take(1)).subscribe((xxx)=>{
            console.log('Joined!', xxx);
        });
        this.skNsCore.fromEvent('ciaChanged'+this.tokenDecifrado.user_nid).pipe(takeUntil(this.$destroy)).subscribe((x:any)=>{
            this.authS.canIsendSocket(false);
            this.authS.interchangeCia(x['newCia'], x['newCiaName']);
            x && x['newCiaName'] && (this.ciaName = x['newCiaName'])
        });
        this.skNsCore.fromEvent('sucursalChanged'+this.tokenDecifrado.user_nid).pipe(takeUntil(this.$destroy)).subscribe((x:any)=>{
            this.authS.canIsendSocket(false);
            this.authS.interchangeSucursal(x['newSucursal']);
        });
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
}
