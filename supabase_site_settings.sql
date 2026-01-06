-- Create site_settings table for Google Analytics and Ads configuration

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  googleAnalyticsId TEXT DEFAULT '',
  googleAdsClientId TEXT DEFAULT '',
  analyticsEnabled BOOLEAN DEFAULT FALSE,
  adsEnabled BOOLEAN DEFAULT FALSE,
  adSlots JSONB DEFAULT '{
    "blogTopBanner": "",
    "blogSidebar": "",
    "blogInContent": "",
    "homeTopBanner": "",
    "homeSidebar": ""
  }'::jsonb,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (id, googleAnalyticsId, googleAdsClientId, analyticsEnabled, adsEnabled, adSlots)
VALUES ('main', '', '', FALSE, FALSE, '{
  "blogTopBanner": "",
  "blogSidebar": "",
  "blogInContent": "",
  "homeTopBanner": "",
  "homeSidebar": ""
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE site_settings IS 'Site-wide settings for Analytics and Advertising';
