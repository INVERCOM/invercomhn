import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminDocumentosFiscalesComponent } from './admin/admin.component';
import { CreateDocumentosFiscalesComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminDocumentosFiscalesComponent 
}];

@NgModule({
    declarations: [AdminDocumentosFiscalesComponent, CreateDocumentosFiscalesComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class DocumentoFiscalesModule { }
