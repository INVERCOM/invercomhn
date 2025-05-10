import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminClientesComponent } from './admin/admin.component';
import { CreateClientesComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminClientesComponent 
}];

@NgModule({
    declarations: [AdminClientesComponent, CreateClientesComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class ClientesModule { }
