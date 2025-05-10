import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminAccesosComponent } from './admin/admin.component';
import { CreateAccesosComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminAccesosComponent 
}];

@NgModule({
    declarations: [AdminAccesosComponent, CreateAccesosComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
})
export class AccesosModule { }
