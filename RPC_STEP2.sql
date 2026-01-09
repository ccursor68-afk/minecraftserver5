CREATE OR REPLACE FUNCTION get_site_settings()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT to_jsonb(site_settings.*) INTO result
  FROM site_settings
  WHERE id = 'main';
  
  RETURN result;
END;
$$;
