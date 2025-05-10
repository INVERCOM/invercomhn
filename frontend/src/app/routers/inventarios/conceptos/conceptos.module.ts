import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminConceptosInventariosComponent } from './admin/admin.component';
import { CreateConceptosInventariosComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminConceptosInventariosComponent 
}];

@NgModule({
    declarations: [AdminConceptosInventariosComponent, CreateConceptosInventariosComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class ConceptosInventariosModule { }
