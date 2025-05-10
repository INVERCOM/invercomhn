import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminImpuestosComponent } from './admin/admin.component';
import { CreateImpuestosComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminImpuestosComponent 
}];

@NgModule({
    declarations: [AdminImpuestosComponent, CreateImpuestosComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class ImpuestosModule { }
