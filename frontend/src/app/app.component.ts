import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { SwUpdate } from '@angular/service-worker';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private primengConfig: PrimeNGConfig, private swUpdate: SwUpdate, public layoutService: LayoutService) {
        if (swUpdate.isEnabled) {
            swUpdate.available.subscribe((info) => {
                console.log('SW 3', info);
                if(confirm("New version available. Load New Version?")) {
                    window.location.reload();
                }
            });
        }
        const theme = localStorage.getItem('theme');
        const colorScheme = localStorage.getItem('colorScheme');
        const scale = localStorage.getItem('scale');
        this.scale = parseInt(scale ? scale : '12');
        this.changeTheme((theme ? theme : 'bootstrap4-dark-blue'), (colorScheme ? colorScheme : 'dark'));
        this.applyScale();
    }

    ngOnInit() {
        this.primengConfig.ripple = true;
    }

    changeTheme(theme: string, colorScheme: string) {
        localStorage.setItem('theme', theme);
        localStorage.setItem('colorScheme', colorScheme);
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
        const newHref = themeLink.getAttribute('href')!.replace(this.layoutService.config.theme, theme);
        this.layoutService.config.colorScheme
        this.replaceThemeLink(newHref, () => {
            this.layoutService.config.theme = theme;
            this.layoutService.config.colorScheme = colorScheme;
            this.layoutService.onConfigUpdate();
        });
    }

    replaceThemeLink(href: string, onComplete: Function) {
        const id = 'theme-css';
        const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
        const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            themeLink.remove();
            cloneLinkElement.setAttribute('id', id);
            onComplete();
        });
    }

    applyScale() {
        document.documentElement.style.fontSize = this.scale + 'px';
    }

    get scale(): number {
        return this.layoutService.config.scale;
    }

    set scale(_val: number) {
        this.layoutService.config.scale = _val;
    }
}
