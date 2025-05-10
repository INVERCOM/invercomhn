import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminLotesComponent } from './admin/admin.component';
import { CreateVentaLotesComponent } from './create/create.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { CurrencyPipe, DatePipe } from '@angular/common';

const routes: Routes = [{
    path: '', component: AdminLotesComponent
}];

@NgModule({
    declarations: [AdminLotesComponent, CreateVentaLotesComponent],
    imports: [
        SharedModule,
        GoogleMapsModule,
        RouterModule.forChild(routes),
    ],
    providers: [DatePipe, CurrencyPipe],
})
export class VentaLotesModule { }
