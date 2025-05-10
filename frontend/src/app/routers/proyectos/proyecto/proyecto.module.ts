import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminProyectoComponent } from './admin/admin-proyecto.component';
import { CreateProyectoComponent } from './create/create-proyecto.component';
import { GoogleMapsModule } from '@angular/google-maps';

const routes: Routes = [{
    path: '', component: AdminProyectoComponent
}];

@NgModule({
    declarations: [AdminProyectoComponent, CreateProyectoComponent],
    imports: [
        SharedModule,
        GoogleMapsModule,
        RouterModule.forChild(routes),
    ],
})
export class ProyectoModule { }
