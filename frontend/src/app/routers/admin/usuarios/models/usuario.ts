export interface Usuario {
    user_nid?: number;
    user_vmail?: string;
    user_vtelefono?: string;
    user_vpass?: string;
    emp_nid?: number;
    user_vtiemposesion?: string;
    user_nsts?: number;
}

export interface UserLogin {
    user_vmail: string;
    user_vpass: string;
}

export interface UserChangePass {
    user_vpass: string;
    user_nsts: number;
}

export interface UserLoginRecover {
    user_vmail: string;
    user_vpassactual: string;
    user_vpassnueva: string;
}

export interface UserRecoverPass {
    user_vmail: string;
}
export interface UsuarioAcceso {
    user_nid: number;
    acce_nid: number;
}

export interface UsuarioCia {
    user_nid: number;
    cia_nid: number;
    usecia_npricipal: number;
}
