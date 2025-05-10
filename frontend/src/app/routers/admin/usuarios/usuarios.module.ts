import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminUsuariosComponent } from './admin/admin.component';
import { CreateUsuariosComponent } from './create/create.component';
import { CambiarContrasenaUsuarioComponent } from './cambiar-contrasena/cambiar-contrasena.component';
import { AsigCiasUsuariosComponent } from './asig-cias/asig-cias.component'
import { AsigAccesosUsuariosComponent } from './asig-accesos/asig-accesos.component';

const routes: Routes = [{
    path: '', component: AdminUsuariosComponent 
}];

@NgModule({
    declarations: [AdminUsuariosComponent, CreateUsuariosComponent, CambiarContrasenaUsuarioComponent, AsigCiasUsuariosComponent, AsigAccesosUsuariosComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class UsuarioModule { }
