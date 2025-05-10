import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminFormasPagosComponent } from './admin/admin.component';
import { CreateFormasPagosComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminFormasPagosComponent 
}];

@NgModule({
    declarations: [AdminFormasPagosComponent, CreateFormasPagosComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class FormasPagosModule { }
