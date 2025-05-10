import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminPuntosEmisionComponent } from './admin/admin.component';
import { CreatePuntosEmisionComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminPuntosEmisionComponent 
}];

@NgModule({
    declarations: [AdminPuntosEmisionComponent, CreatePuntosEmisionComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class PuntosEmisionModule { }
