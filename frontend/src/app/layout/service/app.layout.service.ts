import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppConfig {
    inputStyle: string;
    colorScheme: string;
    theme: string;
    ripple: boolean;
    menuMode: string;
    scale: number;
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class LayoutService {

    config: AppConfig = {
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        theme: 'lara-light-indigo',
        scale: 12,
    };

    state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    private configUpdate = new Subject<AppConfig>();

    private overlayOpen = new Subject<any>();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    onMenuToggle() {
        if (this.isOverlay()) {
            this.state.overlayMenuActive = !this.state.overlayMenuActive;
            if (this.state.overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.state.staticMenuDesktopInactive = !this.state.staticMenuDesktopInactive;
        }
        else {
            this.state.staticMenuMobileActive = !this.state.staticMenuMobileActive;

            if (this.state.staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    showProfileSidebar() {
        this.state.profileSidebarVisible = !this.state.profileSidebarVisible;
        if (this.state.profileSidebarVisible) {
            this.overlayOpen.next(null);
        }
    }

    showConfigSidebar() {
        this.state.configSidebarVisible = true;
    }

    isOverlay() {
        return this.config.menuMode === 'overlay';
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this.configUpdate.next(this.config);
    }

    
    public zonasHorarias = [
        {id: 1, value: -12, text: '(GMT-12:00) International Date Line West'},
        {id: 2, value: -11, text: '(GMT-11:00) Midway Island, Samoa'},
        {id: 3, value: -10, text: '(GMT-10:00) Hawaii'},
        {id: 4, value: -9, text: '(GMT-09:00) Alaska'},
        {id: 5, value: -8, text: '(GMT-08:00) Pacific Time (US & Canada)'},
        {id: 6, value: -8, text: '(GMT-08:00) Tijuana, Baja California'},
        {id: 7, value: -7, text: '(GMT-07:00) Arizona'},
        {id: 8, value: -7, text: '(GMT-07:00) Chihuahua, La Paz, Mazatlan'},
        {id: 9, value: -7, text: '(GMT-07:00) Mountain Time (US & Canada)'},
        {id: 10, value: -6, text: '(GMT-06:00) Central America'},
        {id: 11, value: -6, text: '(GMT-06:00) Central Time (US & Canada)'},
        {id: 12, value: -6, text: '(GMT-06:00) Guadalajara, Mexico City, Monterrey'},
        {id: 13, value: -6, text: '(GMT-06:00) Saskatchewan'},
        {id: 14, value: -5, text: '(GMT-05:00) Bogota, Lima, Quito, Rio Branco'},
        {id: 15, value: -5, text: '(GMT-05:00) Eastern Time (US & Canada)'},
        {id: 16, value: -5, text: '(GMT-05:00) Indiana (East)'},
        {id: 17, value: -4, text: '(GMT-04:00) Atlantic Time (Canada)'},
        {id: 18, value: -4, text: '(GMT-04:00) Caracas, La Paz'},
        {id: 19, value: -4, text: '(GMT-04:00) Manaus'},
        {id: 20, value: -4, text: '(GMT-04:00) Santiago'},
        {id: 21, value: -3.5, text: '(GMT-03:30) Newfoundland'},
        {id: 22, value: -3, text: '(GMT-03:00) Brasilia'},
        {id: 23, value: -3, text: '(GMT-03:00) Buenos Aires, Georgetown'},
        {id: 24, value: -3, text: '(GMT-03:00) Greenland'},
        {id: 25, value: -3, text: '(GMT-03:00) Montevideo'},
        {id: 26, value: -2, text: '(GMT-02:00) Mid-Atlantic'},
        {id: 27, value: -1, text: '(GMT-01:00) Cape Verde Is.'},
        {id: 28, value: -1, text: '(GMT-01:00) Azores'},
        {id: 29, value: 0, text: '(GMT+00:00) Casablanca, Monrovia, Reykjavik'},
        {id: 30, value: 0, text: '(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London'},
        {id: 31, value: 1, text: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'},
        {id: 32, value: 1, text: '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague'},
        {id: 33, value: 1, text: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris'},
        {id: 34, value: 1, text: '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb'},
        {id: 35, value: 1, text: '(GMT+01:00) West Central Africa'},
        {id: 36, value: 2, text: '(GMT+02:00) Amman'},
        {id: 37, value: 2, text: '(GMT+02:00) Athens, Bucharest, Istanbul'},
        {id: 38, value: 2, text: '(GMT+02:00) Beirut'},
        {id: 39, value: 2, text: '(GMT+02:00) Cairo'},
        {id: 40, value: 2, text: '(GMT+02:00) Harare, Pretoria'},
        {id: 41, value: 2, text: '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius'},
        {id: 42, value: 2, text: '(GMT+02:00) Jerusalem'},
        {id: 43, value: 2, text: '(GMT+02:00) Minsk'},
        {id: 44, value: 2, text: '(GMT+02:00) Windhoek'},
        {id: 45, value: 3, text: '(GMT+03:00) Kuwait, Riyadh, Baghdad'},
        {id: 46, value: 3, text: '(GMT+03:00) Moscow, St. Petersburg, Volgograd'},
        {id: 47, value: 3, text: '(GMT+03:00) Nairobi'},
        {id: 48, value: 3, text: '(GMT+03:00) Tbilisi'},
        {id: 49, value: 3.5, text: '(GMT+03:30) Tehran'},
        {id: 50, value: 4, text: '(GMT+04:00) Abu Dhabi, Muscat'},
        {id: 51, value: 4, text: '(GMT+04:00) Baku'},
        {id: 52, value: 4, text: '(GMT+04:00) Yerevan'},
        {id: 53, value: 4.5, text: '(GMT+04:30) Kabul'},
        {id: 54, value: 5, text: '(GMT+05:00) Yekaterinburg'},
        {id: 55, value: 5, text: '(GMT+05:00) Islamabad, Karachi, Tashkent'},
        {id: 56, value: 5.5, text: '(GMT+05:30) Sri Jayawardenapura'},
        {id: 57, value: 5.5, text: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi'},
        {id: 58, value: 5.75, text: '(GMT+05:45) Kathmandu'},
        {id: 59, value: 6, text: '(GMT+06:00) Almaty, Novosibirsk'},
        {id: 60, value: 6, text: '(GMT+06:00) Astana, Dhaka'},
        {id: 61, value: 6.5, text: '(GMT+06:30) Yangon (Rangoon)'},
        {id: 62, value: 7, text: '(GMT+07:00) Bangkok, Hanoi, Jakarta'},
        {id: 63, value: 7, text: '(GMT+07:00) Krasnoyarsk'},
        {id: 64, value: 8, text: '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi'},
        {id: 65, value: 8, text: '(GMT+08:00) Kuala Lumpur, Singapore'},
        {id: 66, value: 8, text: '(GMT+08:00) Irkutsk, Ulaan Bataar'},
        {id: 67, value: 8, text: '(GMT+08:00) Perth'},
        {id: 68, value: 8, text: '(GMT+08:00) Taipei'},
        {id: 69, value: 9, text: '(GMT+09:00) Osaka, Sapporo, Tokyo'},
        {id: 70, value: 9, text: '(GMT+09:00) Seoul'},
        {id: 71, value: 9, text: '(GMT+09:00) Yakutsk'},
        {id: 72, value: 9.5, text: '(GMT+09:30) Adelaide'},
        {id: 73, value: 9.5, text: '(GMT+09:30) Darwin'},
        {id: 74, value: 10, text: '(GMT+10:00) Brisbane'},
        {id: 75, value: 10, text: '(GMT+10:00) Canberra, Melbourne, Sydney'},
        {id: 76, value: 10, text: '(GMT+10:00) Hobart'},
        {id: 77, value: 10, text: '(GMT+10:00) Guam, Port Moresby'},
        {id: 78, value: 10, text: '(GMT+10:00) Vladivostok'},
        {id: 79, value: 11, text: '(GMT+11:00) Magadan, Solomon Is., New Caledonia'},
        {id: 80, value: 12, text: '(GMT+12:00) Auckland, Wellington'},
        {id: 81, value: 12, text: '(GMT+12:00) Fiji, Kamchatka, Marshall Is.'},
        {id: 82, value: 13, text: '(GMT+13:00) Nuku`alofa'},
    ];

}
