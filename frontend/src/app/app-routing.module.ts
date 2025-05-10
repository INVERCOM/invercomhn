import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './pages/components/auth/login/login.component';
import { RecoverComponent } from './pages/components/auth/recover/recover.component';
import { NotAccessComponent } from './pages/components/notaccess/notaccess.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { LoginGuard } from './shared/guards/login.guard';
import { GeneralGuard } from './shared/guards/general.guard';
import { LotesViewGeneralComponent } from './pages/components/lotes-view-general/lotes-view-general.component';
import { DashboardComponent } from './pages/components/dashboard/dashboard.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppLayoutComponent,
                children: [
                    { path: '', redirectTo: 'home/dashboard', pathMatch: 'full', canActivate:[LoginGuard, GeneralGuard], data:{url:'/home'} },
                    { path: 'home/dashboard', loadChildren: () => import('./pages/components/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/home/dashboard'}},

                    { path: 'admin/companias', loadChildren: () => import('./routers/admin/companias/companias.module').then(m => m.CompaniasModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/admin/companias'} },
                    { path: 'admin/sucursales', loadChildren: () => import('./routers/admin/sucursales/sucursales.module').then(m => m.SucursalesModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/admin/sucursales'} },
                    { path: 'admin/usuarios', loadChildren: () => import('./routers/admin/usuarios/usuarios.module').then(m => m.UsuarioModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/admin/usuarios'} },
                    { path: 'admin/modulos', loadChildren: () => import('./routers/admin/modulos/modulos.module').then(m => m.ModulosModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/admin/modulos'} },
                    { path: 'admin/accesos', loadChildren: () => import('./routers/admin/accesos/accesos.module').then(m => m.AccesosModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/admin/accesos'} },
                    
                    { path: 'inventarios/materiales', loadChildren: () => import('./routers/inventarios/materiales/materiales.module').then(m => m.MaterialesModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/inventarios/materiales'} },
                    { path: 'inventarios/conceptosinventarios', loadChildren: () => import('./routers/inventarios/conceptos/conceptos.module').then(m => m.ConceptosInventariosModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/inventarios/conceptosinventarios'} },
                    { path: 'inventarios/impuestos', loadChildren: () => import('./routers/inventarios/impuestos/impuestos.module').then(m => m.ImpuestosModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/inventarios/impuestos'} },
                    { path: 'inventarios/unidadesmedidas', loadChildren: () => import('./routers/inventarios/unidades-medidas/unidadMedida.module').then(m => m.UnidadMedidaModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/inventarios/unidadesmedidas'} },
                    
                    { path: 'ventas/facturas', loadChildren: () => import('./routers/ventas/facturas/facturas.module').then(m => m.FacturasModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/ventas/facturas'} },
                    { path: 'ventas/clientes', loadChildren: () => import('./routers/ventas/clientes/clientes.module').then(m => m.ClientesModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/ventas/clientes'} },
                    { path: 'ventas/puntosemision', loadChildren: () => import('./routers/ventas/puntos-emision/puntosEmision.module').then(m => m.PuntosEmisionModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/ventas/puntosemision'} },
                    { path: 'ventas/registrosfiscales', loadChildren: () => import('./routers/ventas/registros-fiscales/registrosFiscales.module').then(m => m.RegistroFiscalesModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/ventas/registrosfiscales'} },
                    { path: 'ventas/documentosfiscales', loadChildren: () => import('./routers/ventas/documentos-fiscales/documentosFiscales.module').then(m => m.DocumentoFiscalesModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/ventas/documentosfiscales'} },
                    { path: 'ventas/formaspagos', loadChildren: () => import('./routers/ventas/formas-pagos/formasPagos.module').then(m => m.FormasPagosModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/ventas/formaspagos'} },
                    { path: 'ventas/agentes', loadChildren: () => import('./routers/ventas/agentes/agentes.module').then(m => m.AgentesModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/ventas/agentes'} },
                    
                    { path: 'rrhh/empleados', loadChildren: () => import('./routers/rrhh/empleados/empleados.module').then(m => m.EmpleadosModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/rrhh/empleados'} },
                    { path: 'rrhh/asistencias', loadChildren: () => import('./routers/rrhh/asistencias/asistencias.module').then(m => m.AsistenciasModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/rrhh/asistencias'} },
                    
                    { path: 'proyectos/proyecto', loadChildren: () => import('./routers/proyectos/proyecto/proyecto.module').then(m => m.ProyectoModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/proyectos/proyecto'} },
                    { path: 'proyectos/lotes', loadChildren: () => import('./routers/proyectos/lotes/lotes.module').then(m => m.LotesModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/proyectos/lotes'} },
                    { path: 'proyectos/ventaslotes', loadChildren: () => import('./routers/proyectos/ventas-lotes/VentaLotes.module').then(m => m.VentaLotesModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/proyectos/ventaslotes'} },
                    { path: 'proyectos/pagoslotes', loadChildren: () => import('./routers/proyectos/pagos-lotes/pagosLotes.module').then(m => m.PagosLotesModule), canActivate:[LoginGuard, GeneralGuard], data:{url:'/proyectos/pagoslotes'} },
                    
                    { path: 'uikit', loadChildren: () => import('./pages/components/uikit/uikit.module').then(m => m.UIkitModule) },
                    { path: 'utilities', loadChildren: () => import('./pages/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
                    { path: 'documentation', loadChildren: () => import('./pages/components/documentation/documentation.module').then(m => m.DocumentationModule) },
                    { path: 'blocks', loadChildren: () => import('./pages/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
                    { path: 'pages', loadChildren: () => import('./pages/components/pages/pages.module').then(m => m.PagesModule) },
                ]
            },
            { path: 'auth', loadChildren: () => import('./pages/components/auth/auth.module').then(m => m.AuthModule) },
            { path: 'landing', loadChildren: () => import('./pages/components/landing/landing.module').then(m => m.LandingModule) },
            { path: '403', component: NotAccessComponent },
            { path: 'login', component: LoginComponent },
            { path: 'main', component: LotesViewGeneralComponent },
            { path: 'recover', component: RecoverComponent },
            { path: '**', redirectTo: 'main' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
