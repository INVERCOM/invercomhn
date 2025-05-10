export interface Material {
    mater_nid?: number;
    cia_nid?: number;
    mater_vcodigo?: string;
    mater_vdescripcion?: string;
    mater_vnombre?: string;
    mater_vcodbar?: string;
    mater_nprecio?: number;
    mater_ncosto?: number;
    mater_ntipomanejo?: number;
    mater_nisv?: number;
    mater_nisvincluido?: number;
    mater_nmostrarfact?: number;
    mater_nsts?: number;
}

export interface MaterialSts {
    mater_nid?: number;
    mater_nsts?: number;
}