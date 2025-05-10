import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminPagosLotesComponent } from './admin/admin-pagos-lotes.component';
import { CreatePagosLotesComponent } from './create/create-pagos-lotes.component';
import { AdminPagosClientesComponent } from './admin-pagos-clientes/admin-pagos-clientes.component';

const routes: Routes = [{
    path: '', component: AdminPagosLotesComponent
}];

@NgModule({
    declarations: [AdminPagosLotesComponent, CreatePagosLotesComponent, AdminPagosClientesComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class PagosLotesModule { }
