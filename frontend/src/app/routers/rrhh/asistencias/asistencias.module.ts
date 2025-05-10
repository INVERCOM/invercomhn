import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminAsistenciasComponent } from './admin/admin.component';
import { CreateAsistenciasComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminAsistenciasComponent 
}];

@NgModule({
    declarations: [AdminAsistenciasComponent, CreateAsistenciasComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class AsistenciasModule { }
