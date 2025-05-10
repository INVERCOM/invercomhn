// ====================== ADMIN =========================
require('../../models/admin/_tmonedas');
require('../../models/admin/_tusuarios');
require('../../models/admin/_tmodulos');
require('../../models/admin/_tcias');
require('../../models/admin/_tsucursales');
require('../../models/admin/_taccesos');
require('../../models/admin/_tasig_cias_modulos');
require('../../models/admin/_tasig_user_accesos');
require('../../models/admin/_tasig_user_cia');
require('../../models/admin/_tasig_sucursal_user');

// ===============++= INVENTARIOS =======================

require('../../models/inventarios/_tmateriales');
require('../../models/inventarios/_timpuestos');
require('../../models/inventarios/_tasig_materiales_impuestos');
require('../../models/inventarios/_tunidades_medidas');

// ====================== VENTAS =========================

require('../../models/ventas/_tclientes');
require('../../models/ventas/_tpuntos_emision');
require('../../models/ventas/_tregistros_fiscales');
require('../../models/ventas/_tdocumentos_fiscales');
require('../../models/ventas/_tformas_pagos');
require('../../models/ventas/_tagentes');

// ====================== RRHH =========================

require('../../models/rrhh/_templeados');
require('../../models/rrhh/_tasistencias');

// ====================== PROYECTOS =========================

require('../../models/proyectos/_tproyectos');
require('../../models/proyectos/_tlotes');
