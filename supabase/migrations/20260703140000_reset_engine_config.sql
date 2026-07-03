-- Elimină config-ul global `engine_config` din DB: motorul folosește acum
-- DEFAULT_CONFIG din cod ca sursă unică (evită drift-ul între cod și DB).
-- Overrides regionale se pot adăuga ulterior ca rânduri cu `region` != NULL.
delete from public.config_parameters
where region is null and key = 'engine_config';
