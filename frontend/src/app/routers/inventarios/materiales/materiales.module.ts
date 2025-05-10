import { NgModule } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminMaterialesComponent } from './admin/admin.component';
import { CreateMaterialesComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminMaterialesComponent 
}];

@NgModule({
    declarations: [AdminMaterialesComponent, CreateMaterialesComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ],
    providers: [CurrencyPipe]
})
export class MaterialesModule { }
