import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminEmpleadosComponent } from './admin/admin.component';
import { CreateEmpleadosComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminEmpleadosComponent 
}];

@NgModule({
    declarations: [AdminEmpleadosComponent, CreateEmpleadosComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class EmpleadosModule { }
