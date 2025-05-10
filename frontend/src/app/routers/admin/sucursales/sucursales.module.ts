import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminSucursalesComponent } from './admin/admin.component';
import { CreateSucursalesComponent } from './create/create.component';
import { AsigUsuariosSucursalesComponent } from './asig-usuarios/asig-usuarios.component';

const routes: Routes = [{
    path: '', component: AdminSucursalesComponent 
}];

@NgModule({
    declarations: [AdminSucursalesComponent, CreateSucursalesComponent, AsigUsuariosSucursalesComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class SucursalesModule { }
