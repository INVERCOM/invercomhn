import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AdminAgentesComponent } from './admin/admin.component';
import { CreateAgentesComponent } from './create/create.component';

const routes: Routes = [{
    path: '', component: AdminAgentesComponent 
}];

@NgModule({
    declarations: [AdminAgentesComponent, CreateAgentesComponent],
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class AgentesModule { }
