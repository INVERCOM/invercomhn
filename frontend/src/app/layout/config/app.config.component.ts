import { Component, Input } from '@angular/core';
import { LayoutService } from "../service/app.layout.service";
import { MenuService } from "../app.menu.service";
import { AuthService } from 'src/app/shared/services/auth.service';
import { take, takeUntil } from 'rxjs';
import { SkNsCore } from 'src/app/shared/services/sockets.service';
import { DatePipe } from '@angular/common';
interface CheesyObject { id: string; text: string; obj: object}
@Component({
    selector: 'app-config',
    styleUrls: ['./app.config.component.scss'],
    templateUrl: './app.config.component.html'
})
export class AppConfigComponent {

    public cias : any;
    public sucursales : any;
    public zona : any;
    public zonasHorarias : any;
    public cia : any;
    public sucursal : any;
    @Input() minimal: boolean = false;
    public scales: number[] = [10, 11, 12, 13, 14, 15, 16];
    constructor(public layoutService: LayoutService, public menuService: MenuService, public auth: AuthService, public datePipe: DatePipe, private skNsCore: SkNsCore) {
        this.zonasHorarias = [...this.layoutService.zonasHorarias];
        if (!(localStorage.getItem('timezone') != null)) {
            const zona: any = datePipe.transform(new Date(), 'z');
            const zonaActual = zona.split('GMT') && zona.split('GMT').length > 1 ? parseInt( zona.split('GMT')[1] )?.toString() : '0';
            this.zona = this.searchByValue( zonaActual, this.zonasHorarias);
            this.setZona(this.zona);
        }else{
            this.zona = this.searchById( localStorage.getItem('timezone-id'), this.zonasHorarias);
        }
        const scale = localStorage.getItem('scale');
        const menuMode = localStorage.getItem('menuMode');
        const inputStyle = localStorage.getItem('inputStyle');
        const ripple = localStorage.getItem('ripple');
        const theme = localStorage.getItem('theme');
        const colorScheme = localStorage.getItem('colorScheme');
        this.scale = parseInt(scale ? scale : '12');
        this.menuMode = menuMode ? menuMode : 'static';
        this.inputStyle = inputStyle ? inputStyle : 'outlined';
        this.ripple = ripple == 'true';
        this.changeTheme((theme ? theme : 'bootstrap4-light-blue'), (colorScheme ? colorScheme : 'light'));
        this.getCias();
       
        this.applyScale();
    }

    get visible(): boolean {
        return this.layoutService.state.configSidebarVisible;
    }

    set visible(_val: boolean) {
        this.layoutService.state.configSidebarVisible = _val;
    }

    get scale(): number {
        return this.layoutService.config.scale;
    }

    set scale(_val: number) {
        this.layoutService.config.scale = _val;
    }

    get menuMode(): string {
        return this.layoutService.config.menuMode;
    }

    set menuMode(_val: string) {
        this.layoutService.config.menuMode = _val;
    }

    get inputStyle(): string {
        return this.layoutService.config.inputStyle;
    }

    set inputStyle(_val: string) {
        this.layoutService.config.inputStyle = _val;
    }

    get ripple(): boolean {
        return this.layoutService.config.ripple;
    }

    set ripple(_val: boolean) {
        this.layoutService.config.ripple = _val;
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }

    getCias() {
        this.cias = [];
        // this.auth.getCiasAsignadas().pipe(take(1)).subscribe((data:any) => {
        //     if ( !data || data == null || data === '' ) {
        //         console.log('Error consultando compañías');
        //         return;
        //     }
        //     data.forEach((element: { [x: string]: any; }) => {
        //         const item={id:element['cia_nid'], label:element['cia_vnombre'], value: element['cia_nid'], obj:element}
        //         this.cias = [ ...this.cias, item ];
        //     });
        //     this.cia = localStorage.getItem('cia')?.toString();
        // });
        const data = this.auth && this.auth.usuario && this.auth.usuario.cias ? this.auth.usuario.cias : [];
        data.forEach((element: any) => {
            const item={id:element['cia_nid'], text:element['cia_vnombre'], value: element['cia_nid'], obj:element}
            this.cias = [ ...this.cias, item ];
        });
        this.cia = this.searchById(localStorage.getItem('cia')?.toString(), this.cias);
        this.getSucursales();
    }

    getSucursales() {
        this.sucursales = [];
        const ciaId  = localStorage.getItem('cia')?.toString()
        const data = this.auth && this.auth.usuario && this.auth.usuario.sucursales ? this.auth.usuario.sucursales : [];
        data.forEach((element: any) => {
            const item={id:element['sucu_nid'], text:element['sucu_vnombre'], value: element['sucu_nid'], obj:element}
            if (ciaId == element['cia_nid'] ) {
                this.sucursales = [ ...this.sucursales, item ];
            }
        });
        this.sucursal = this.searchById(localStorage.getItem('sucursal')?.toString(), this.sucursales);
        if (!(this.sucursal.id > 0) && this.sucursales && this.sucursales[0]) {
            this.setSucursal(this.sucursales[0])
            this.sucursal = this.searchById(this.sucursales[0].id, this.sucursales);
        }
    }

    setCia(value: any) {
        this.auth.cia = value.id;
        this.skNsCore.interChangeCia( localStorage.getItem('cia')!, value.id, this.auth.isValidCia(), this.auth.parseJwt(localStorage.getItem('jwt')!).user_nid, true, value.text );
        localStorage.setItem('cia', value.id);
        localStorage.setItem('ciaName', value.text);
        this.getSucursales();
    }

    setSucursal(value: any) {
        this.auth.sucursal = value.id;
        this.skNsCore.interChangeSucursal(value.id, this.auth.parseJwt(localStorage.getItem('jwt')!).user_nid, true);
        localStorage.setItem('sucursal', value.id);
    }

    setZona(value: any) {
        localStorage.setItem('timezone', value.value);
        localStorage.setItem('timezone-id', value.id);
    }

    changeTheme(theme: string, colorScheme: string) {
        localStorage.setItem('theme', theme);
        localStorage.setItem('colorScheme', colorScheme);
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
        const newHref = themeLink.getAttribute('href')!.replace(this.layoutService.config.theme, theme);
        this.layoutService.config.colorScheme
        this.replaceThemeLink(newHref, () => {
            this.layoutService.config.theme = theme;
            this.layoutService.config.colorScheme = colorScheme;
            this.layoutService.onConfigUpdate();
        });
    }

    replaceThemeLink(href: string, onComplete: Function) {
        const id = 'theme-css';
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
        const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            themeLink.remove();
            cloneLinkElement.setAttribute('id', id);
            onComplete();
        });
    }

    decrementScale() {
        this.scale--;
        this.applyScale();
        localStorage.setItem('scale', this.scale.toString());
    }

    incrementScale() {
        this.scale++;
        this.applyScale();
        localStorage.setItem('scale', this.scale.toString());
    }

    applyScale() {
        document.documentElement.style.fontSize = this.scale + 'px';
    }

    changeMenuMode(){
        localStorage.setItem('menuMode', this.menuMode.toString());
    }

    changeInputStyle(){
        localStorage.setItem('inputStyle', this.inputStyle.toString());
    }

    changeRipple(){
        localStorage.setItem('ripple', this.ripple.toString());
    }

    searchById(id: any, array: any[]) {
        for (let index = 0; index < array.length; index++) {
            const row = array[index];
            if (row.id == id) {
                return row;
            }
        }
        return '';
    }

    searchByValue(value: any, array: any[]) {
        for (let index = 0; index < array.length; index++) {
            const row = array[index];
            if (row.value == value) {
                return row;
            }
        }
        return '';
    }
}
