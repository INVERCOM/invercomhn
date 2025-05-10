import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminModuloComponent } from './admin/admin.component';
import { CreateModuloComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminModuloComponent 
}];

@NgModule({
    declarations: [AdminModuloComponent, CreateModuloComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class ModulosModule { }
