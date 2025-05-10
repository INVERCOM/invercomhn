export interface Sucursal {
    sucu_nid?: number;
    cia_nid?: number;
    sucu_vcodigo?: string;
    sucu_vnombre?: string;
    sucu_vdireccion?: string;
    sucu_vtelefono?: string;
    sucu_vcorreo?: string;
    sucu_nsts?: number;
}

export interface SucursalSts {
    sucu_nid?: number;
    sucu_nsts?: number;
}

export interface SucursalUsuario {
    sucu_nid: number;
    user_nid: number;
}