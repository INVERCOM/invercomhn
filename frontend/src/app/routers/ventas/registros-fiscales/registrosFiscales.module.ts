import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminRegistrosFiscalesComponent } from './admin/admin.component';
import { CreateRegistrosFiscalesComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminRegistrosFiscalesComponent 
}];

@NgModule({
    declarations: [AdminRegistrosFiscalesComponent, CreateRegistrosFiscalesComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class RegistroFiscalesModule { }
