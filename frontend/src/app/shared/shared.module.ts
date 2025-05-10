import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorsService } from './colors/colors.service';
import { SkNsCore, SocketsService } from './services/sockets.service';
import { ToolsService } from './services/tools.service';
import { TimezoneService } from './services/timezone.service';
import { MytimezonePipe } from './pipes/mytimezone.pipe';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { MultiSelectModule } from "primeng/multiselect";
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ShowmePipe } from './pipes/showme.pipe';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        FileUploadModule,
        ButtonModule,
        SelectButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        InputTextareaModule,
        DropdownModule,
        MultiSelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        ReactiveFormsModule,
        ToastrModule.forRoot(),
    ],
    providers: [
        SocketsService,
        ColorsService,
        DatePipe,
        CurrencyPipe,
        TimezoneService
    ],
    declarations: [
        MytimezonePipe,
        ShowmePipe
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ShowmePipe,
        TableModule,
        FileUploadModule,
        ButtonModule,
        SelectButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        InputTextareaModule,
        DropdownModule,
        MultiSelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule
    ]
})

export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule
        };
    }
}

@NgModule({
    imports: [],
    providers: [
        ToolsService,
        // SkNsAdmin,
        SkNsCore,
        DatePipe
    ],
    exports: [],
    declarations: []
})
export class CustomSharedModule {
    constructor() {}
}