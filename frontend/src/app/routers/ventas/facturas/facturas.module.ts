import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminFacturasComponent } from './admin/admin.component';
import { CreateFacturasComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminFacturasComponent 
}];

@NgModule({
    declarations: [AdminFacturasComponent, CreateFacturasComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class FacturasModule { }
