import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { ShowmePipe } from '../shared/pipes/showme.pipe';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(
        public layoutService: LayoutService,
        public showMe: ShowmePipe
    ) { }

    ngOnInit() {
        this.model = [{
                label: 'Home',
                visible: this.showMe.transform('/home'),
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/home/dashboard'], visible: this.showMe.transform('/home/dashboard') }
                ]
            },
            {
                label:'Administración',
                visible: this.showMe.transform('/admin'),
                items: [
                    {label: 'Compañías', icon: 'pi pi-fw pi-building', routerLink: ['/admin/companias'], visible: this.showMe.transform('/admin/companias')},
                    {label: 'Sucursales', icon: 'pi pi-fw pi-sitemap', routerLink: ['/admin/sucursales'], visible: this.showMe.transform('/admin/sucursales')},
                    {label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/admin/usuarios'], visible: this.showMe.transform('/admin/usuarios')},
                    {label: 'Módulos', icon: 'pi pi-fw pi-box', routerLink: ['/admin/modulos'], visible: this.showMe.transform('/admin/modulos')},
                    {label: 'Accesos', icon: 'pi pi-fw pi-lock', routerLink: ['/admin/accesos'], visible: this.showMe.transform('/admin/accesos')},
                ]
            },
            {
                label:'Proyectos',
                visible: this.showMe.transform('/proyectos') || true,
                items: [
                    {label: 'Proyectos', icon: 'pi pi-fw pi-building', routerLink: ['/proyectos/proyecto'], visible: this.showMe.transform('/proyectos/proyecto')},
                    {label: 'Lotes', icon: 'pi pi-fw pi-th-large', routerLink: ['/proyectos/lotes'], visible: this.showMe.transform('/proyectos/lotes')},
                    {label: 'Venta lotes', icon: 'pi pi-fw pi-dollar', routerLink: ['/proyectos/ventaslotes'], visible: this.showMe.transform('/proyectos/ventaslotes')},
                    {label: 'Pagos lotes', icon: 'pi pi-fw pi-money-bill', routerLink: ['/proyectos/pagoslotes'], visible: this.showMe.transform('/proyectos/pagoslotes')},
                ]
            },
            {
                label:'Inventarios',
                visible: this.showMe.transform('/inventarios'),
                items: [
                    {label: 'Materiales', icon: 'pi pi-fw pi-book', routerLink: ['/inventarios/materiales'], visible: this.showMe.transform('/inventarios/materiales')},
                    {label: 'Conceptos', icon: 'pi pi-fw pi-bars', routerLink: ['/inventarios/conceptosinventarios'], visible: this.showMe.transform('/inventarios/conceptosinventarios')},
                    {label: 'Impuestos', icon: 'pi pi-fw pi-money-bill', routerLink: ['/inventarios/impuestos'], visible: this.showMe.transform('/inventarios/impuestos')},
                    {label: 'Unidades medidas', icon: 'pi pi-fw pi-filter-fill', routerLink: ['/inventarios/unidadesmedidas'], visible: this.showMe.transform('/inventarios/unidadesmedidas')},
                ]
            },
            {
                label:'Ventas',
                visible: this.showMe.transform('/ventas'),
                items: [
                    {label: 'Facturas', icon: 'pi pi-fw pi-file', routerLink: ['/ventas/facturas'], visible: this.showMe.transform('/ventas/facturas')},
                    {label: 'Clientes', icon: 'pi pi-fw pi-users', routerLink: ['/ventas/clientes'], visible: this.showMe.transform('/ventas/clientes')},
                    {label: 'Puntos emisión', icon: 'pi pi-fw pi-print', routerLink: ['/ventas/puntosemision'], visible: this.showMe.transform('/ventas/puntosemision')},
                    {label: 'Registros fiscales', icon: 'pi pi-fw pi-list', routerLink: ['/ventas/registrosfiscales'], visible: this.showMe.transform('/ventas/registrosfiscales')},
                    {label: 'Documentos fiscales', icon: 'pi pi-fw pi-copy', routerLink: ['/ventas/documentosfiscales'], visible: this.showMe.transform('/ventas/documentosfiscales')},
                    {label: 'Formas pagos', icon: 'pi pi-fw pi-credit-card', routerLink: ['/ventas/formaspagos'], visible: this.showMe.transform('/ventas/formaspagos')},
                    {label: 'Agentes', icon: 'pi pi-fw pi-user', routerLink: ['/ventas/agentes'], visible: this.showMe.transform('/ventas/agentes')},
                ]
            },
            {
                label:'Recursos humanos',
                visible: this.showMe.transform('/rrhh'),
                items: [
                    {label: 'Empleados', icon: 'pi pi-fw pi-user-edit', routerLink: ['/rrhh/empleados'], visible: this.showMe.transform('/rrhh/empleados')},
                    {label: 'Asistencias', icon: 'pi pi-fw pi-pencil', routerLink: ['/rrhh/asistencias'], visible: this.showMe.transform('/rrhh/asistencias')},
                ]
            },
            // {
            //     label: 'UI Components',
            //     items: [
            //         { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
            //         { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
            //         { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', routerLink: ['/uikit/floatlabel'] },
            //         { label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/uikit/invalidstate'] },
            //         { label: 'Button', icon: 'pi pi-fw pi-box', routerLink: ['/uikit/button'] },
            //         { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
            //         { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
            //         { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
            //         { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
            //         { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
            //         { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
            //         { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'], routerLinkActiveOptions: { paths: 'subset', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' } },
            //         { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
            //         { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
            //         { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
            //         { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] },
                    
            //     ]
            // },
            // {
            //     label: 'Prime Blocks',
            //     items: [
            //         { label: 'Free Blocks', icon: 'pi pi-fw pi-eye', routerLink: ['/blocks'], badge: 'NEW' },
            //         { label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: ['https://www.primefaces.org/primeblocks-ng'], target: '_blank' },
            //     ]
            // },
            // {
            //     label: 'Utilities',
            //     items: [
            //         { label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', routerLink: ['/utilities/icons'] },
            //         { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/'], target: '_blank' },
            //     ]
            // },
            // {
            //     label: 'Pages',
            //     icon: 'pi pi-fw pi-briefcase',
            //     items: [
            //         {
            //             label: 'Landing',
            //             icon: 'pi pi-fw pi-globe',
            //             routerLink: ['/landing']
            //         },
            //         {
            //             label: 'Auth',
            //             icon: 'pi pi-fw pi-user',
            //             items: [
            //                 {
            //                     label: 'Login',
            //                     icon: 'pi pi-fw pi-sign-in',
            //                     routerLink: ['/auth/login']
            //                 },
            //                 {
            //                     label: 'Error',
            //                     icon: 'pi pi-fw pi-times-circle',
            //                     routerLink: ['/auth/error']
            //                 },
            //                 {
            //                     label: 'Access Denied',
            //                     icon: 'pi pi-fw pi-lock',
            //                     routerLink: ['/auth/access']
            //                 }
            //             ]
            //         },
            //         {
            //             label: 'Crud',
            //             icon: 'pi pi-fw pi-pencil',
            //             routerLink: ['/pages/crud']
            //         },
            //         {
            //             label: 'Timeline',
            //             icon: 'pi pi-fw pi-calendar',
            //             routerLink: ['/pages/timeline']
            //         },
            //         {
            //             label: 'Not Found',
            //             icon: 'pi pi-fw pi-exclamation-circle',
            //             routerLink: ['/notfound']
            //         },
            //         {
            //             label: 'Empty',
            //             icon: 'pi pi-fw pi-circle-off',
            //             routerLink: ['/pages/empty']
            //         },
            //     ]
            // },
            // {
            //     label: 'Hierarchy',
            //     items: [
            //         {
            //             label: 'Submenu 1', icon: 'pi pi-fw pi-bookmark',
            //             items: [
            //                 {
            //                     label: 'Submenu 1.1', icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' },
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 1.2', icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }
            //                     ]
            //                 },
            //             ]
            //         },
            //         {
            //             label: 'Submenu 2', icon: 'pi pi-fw pi-bookmark',
            //             items: [
            //                 {
            //                     label: 'Submenu 2.1', icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' },
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 2.2', icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' },
            //                     ]
            //                 },
            //             ]
            //         }
            //     ]
            // },
            // {
            //     label: 'Get Started',
            //     items: [
            //         {
            //             label: 'Documentation', icon: 'pi pi-fw pi-question', routerLink: ['/documentation']
            //         },
            //         {
            //             label: 'View Source', icon: 'pi pi-fw pi-search', url: ['https://github.com/primefaces/sakai-ng'], target: '_blank'
            //         }
            //     ]
            // }
        ];
        
    }
}
