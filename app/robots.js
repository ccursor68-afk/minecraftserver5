export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/'],
        crawlDelay: 0,
      },
    ],
    sitemap: 'https://minecraftserverlist.com/sitemap.xml',
  }
}
