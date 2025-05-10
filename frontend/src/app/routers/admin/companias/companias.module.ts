import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateCompaniasComponent } from './create/create.component';
import { AdminCompaniasComponent } from './admin/admin.component';
import { AsigModulosCiasComponent } from './asig-modulos/asig-modulos.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [{
    path: '', component: AdminCompaniasComponent 
}];

@NgModule({
    declarations: [AdminCompaniasComponent, CreateCompaniasComponent, AsigModulosCiasComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class CompaniasModule { }
