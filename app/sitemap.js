import { supabaseAdmin } from '@/lib/supabase'

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://minecraftserverlist.com'

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  try {
    // Get all blog categories
    const { data: categories } = await supabaseAdmin
      .from('blog_categories')
      .select('slug, updatedAt')
      .order('name', { ascending: true })

    if (categories) {
      categories.forEach((category) => {
        routes.push({
          url: `${baseUrl}/blog/${category.slug}`,
          lastModified: category.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      })
    }

    // Get all blog posts
    const { data: posts } = await supabaseAdmin
      .from('blog_posts')
      .select('slug, updatedAt, createdAt')
      .order('createdAt', { ascending: false })

    if (posts) {
      posts.forEach((post) => {
        routes.push({
          url: `${baseUrl}/blog/post/${post.slug}`,
          lastModified: post.updatedAt || post.createdAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      })
    }

    // Get all servers
    const { data: servers } = await supabaseAdmin
      .from('servers')
      .select('id, updatedAt')
      .order('voteCount', { ascending: false })
      .limit(100)

    if (servers) {
      servers.forEach((server) => {
        routes.push({
          url: `${baseUrl}/server/${server.id}`,
          lastModified: server.updatedAt || new Date(),
          changeFrequency: 'daily',
          priority: 0.6,
        })
      })
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}
