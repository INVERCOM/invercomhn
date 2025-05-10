import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminLotesComponent } from './admin/admin-lotes.component';
import { CreateLotesComponent } from './create/create-lotes.component';
import { GoogleMapsModule } from '@angular/google-maps';

const routes: Routes = [{
    path: '', component: AdminLotesComponent
}];

@NgModule({
    declarations: [AdminLotesComponent, CreateLotesComponent],
    imports: [
        SharedModule,
        GoogleMapsModule,
        RouterModule.forChild(routes),
    ],
})
export class LotesModule { }
