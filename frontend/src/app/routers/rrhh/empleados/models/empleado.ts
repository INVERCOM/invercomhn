export interface Empleado {
    emp_nid?: number;
    cia_nid?: number;
    emp_vcodigo?: string;
    emp_videntidad?: string;
    emp_vnombre?: string;
    emp_vapellido?: string;
    emp_vdireccion?: string;
    emp_vtelefono?: string;
    emp_vfechaingreso?: string;
    emp_nsts?: number;
}

export interface EmpleadoSts {
    emp_nid?: number;
    emp_nsts?: number;
}