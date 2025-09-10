const sql = `

CREATE OR REPLACE FUNCTION proyectos._cambiar_estatus_lote_vendido()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
	declare 
	begin
		if new.venlot_nsts = 1 and new.lote_nid > 0 then
			update proyectos._tlotes set lote_nsts = 2 where lote_nid = new.lote_nid;
		end if;
		return new;
	end
$function$;

DO $$
BEGIN
	IF (select count(*) FROM pg_tables WHERE  schemaname = 'proyectos' AND tablename = '_tventas_lotes') > 0 THEN
		DROP TRIGGER IF EXISTS _cambiar_estatus_lote_vendido_trigger on proyectos._tventas_lotes;
		CREATE TRIGGER _cambiar_estatus_lote_vendido_trigger AFTER
		INSERT ON proyectos._tventas_lotes for each row execute procedure proyectos._cambiar_estatus_lote_vendido();
	END IF;
END $$;

`;

module.exports = sql;