export interface Compania {
    cia_nid?: number;
    cia_vnombre?: string;
    cia_vnombrecomercial?: string;
    cia_vdireccion?: string;
    cia_vtelefono?: string;
    cia_vrtn?: string;
    cia_vcorreo?: string;
    mone_nid?: string;
    cia_nsts?: number;
}

export interface CompaniaSts {
    cia_nid?: number;
    cia_nsts?: number;
}

export interface ModulosCias {
    cia_nid?: number;
    modu_nid?: number;
}
