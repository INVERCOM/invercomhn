export interface PuntoEmision {
    punemi_nid?: number;
    sucu_nid?: number;
    punemi_vcodigo?: string;
    punemi_vdescripcion?: string;
    punemi_vdireccion?: string;
    punemi_vtelefono?: string;
    punemi_nconfinventario?: number;
    punemi_nvalidarfactura?: number;
    punemi_nsts?: number;
}

export interface PuntoEmisionSts {
    punemi_nid?: number;
    punemi_nsts?: number;
}