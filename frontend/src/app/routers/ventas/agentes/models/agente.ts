export interface Agente {
    agen_nid ?: number;
    cia_nid?: number;
    agen_vcodigo?: string;
    agen_vnombre?: string;
    agen_ntipo?: number;
    agen_nsts?: number;
}

export interface AgenteSts {
    agen_nid?: number;
    agen_nsts?: number;
}