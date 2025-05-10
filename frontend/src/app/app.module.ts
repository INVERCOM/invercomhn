import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { SkNsCore } from './shared/services/sockets.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './pages/components/notfound/notfound.component';
import { NotAccessComponent } from './pages/components/notaccess/notaccess.component';
import { ProductService } from './pages/service/product.service';
import { CountryService } from './pages/service/country.service';
import { CustomerService } from './pages/service/customer.service';
import { EventService } from './pages/service/event.service';
import { IconService } from './pages/service/icon.service';
import { NodeService } from './pages/service/node.service';
import { PhotoService } from './pages/service/photo.service';
import { SharedModule, CustomSharedModule } from './shared/shared.module';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { ServiceWorkerModule } from '@angular/service-worker';
import { GoogleMapsModule } from '@angular/google-maps';
import { LotesViewGeneralComponent } from './pages/components/lotes-view-general/lotes-view-general.component';

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent, NotAccessComponent, LotesViewGeneralComponent
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        GoogleMapsModule,
        SharedModule.forRoot(),
        CustomSharedModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: !isDevMode(),
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
            CountryService, CustomerService, EventService, IconService, NodeService,
            PhotoService, ProductService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JwtInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
