import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminUnidadesMedidasComponent } from './admin/admin.component';
import { CreateUnidadesMedidasComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminUnidadesMedidasComponent 
}];

@NgModule({
    declarations: [AdminUnidadesMedidasComponent, CreateUnidadesMedidasComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class UnidadMedidaModule { }
