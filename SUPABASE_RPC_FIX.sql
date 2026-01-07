-- Supabase'de çalıştırın: Schema cache fix için

-- Step 1: RPC function oluştur (UPDATE için)
CREATE OR REPLACE FUNCTION update_site_settings(
  p_sitename TEXT DEFAULT NULL,
  p_primarycolor TEXT DEFAULT NULL,
  p_secondarycolor TEXT DEFAULT NULL,
  p_accentcolor TEXT DEFAULT NULL,
  p_logourl TEXT DEFAULT NULL,
  p_faviconurl TEXT DEFAULT NULL,
  p_sitetagline TEXT DEFAULT NULL,
  p_footertext TEXT DEFAULT NULL,
  p_googleanalyticsid TEXT DEFAULT NULL,
  p_googleadsclientid TEXT DEFAULT NULL,
  p_analyticsenabled BOOLEAN DEFAULT NULL,
  p_adsenabled BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE site_settings
  SET
    sitename = COALESCE(p_sitename, sitename),
    primarycolor = COALESCE(p_primarycolor, primarycolor),
    secondarycolor = COALESCE(p_secondarycolor, secondarycolor),
    accentcolor = COALESCE(p_accentcolor, accentcolor),
    logourl = COALESCE(p_logourl, logourl),
    faviconurl = COALESCE(p_faviconurl, faviconurl),
    sitetagline = COALESCE(p_sitetagline, sitetagline),
    footertext = COALESCE(p_footertext, footertext),
    googleanalyticsid = COALESCE(p_googleanalyticsid, googleanalyticsid),
    googleadsclientid = COALESCE(p_googleadsclientid, googleadsclientid),
    analyticsenabled = COALESCE(p_analyticsenabled, analyticsenabled),
    adsenabled = COALESCE(p_adsenabled, adsenabled),
    updatedat = NOW()
  WHERE id = 'main'
  RETURNING to_jsonb(site_settings.*) INTO result;
  
  RETURN result;
END;
$$;

-- Step 2: RPC function (GET için)
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

-- Test
SELECT update_site_settings(p_sitename := 'Test', p_primarycolor := '#ff0000');
SELECT get_site_settings();
