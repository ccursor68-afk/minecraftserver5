import Link from 'next/link'
import { Gamepad2, ArrowLeft, BookOpen, MessageSquare, Clock, User, Eye, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StructuredData from '@/components/blog/StructuredData'
import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  try {
    const { data: category } = await supabaseAdmin
      .from('blog_categories')
      .select('id, name, slug, description, icon, color')
      .eq('slug', slug)
      .single()

    if (!category) {
      return {
        title: 'Kategori Bulunamadı - Minecraft Server List Blog',
        description: 'Aradığınız kategori bulunamadı.'
      }
    }

    return {
      title: `${category.name} - Minecraft Server Blog & Forum | Rehberler ve İpuçları`,
      description: category.description || `${category.name} kategorisindeki tüm Minecraft rehberlerini, ipuçlarını ve topluluk tartışmalarını keşfedin.`,
      keywords: [
        category.name,
        'minecraft ' + category.name.toLowerCase(),
        'minecraft rehber',
        'minecraft forum',
        'minecraft ipuçları',
        'minecraft guides',
        'minecraft tips',
        'minecraft community'
      ],
      openGraph: {
        title: `${category.name} - Minecraft Server Blog`,
        description: category.description || `${category.name} kategorisindeki Minecraft içerikleri`,
        type: 'website',
        locale: 'tr_TR',
        alternateLocale: ['en_US'],
        images: [
          {
            url: `https://via.placeholder.com/1200x630/${category.color.replace('#', '')}/ffffff?text=${encodeURIComponent(category.name)}`,
            width: 1200,
            height: 630,
            alt: category.name
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${category.name} - Minecraft Blog`,
        description: category.description || `${category.name} kategorisindeki Minecraft içerikleri`,
        images: [`https://via.placeholder.com/1200x630/${category.color.replace('#', '')}/ffffff?text=${encodeURIComponent(category.name)}`]
      },
      alternates: {
        canonical: `/blog/${slug}`,
        languages: {
          'tr-TR': `/blog/${slug}`,
          'en-US': `/blog/${slug}`
        }
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Minecraft Server List Blog',
      description: 'Minecraft rehberleri ve topluluk forumu'
    }
  }
}

// Fetch category data
async function getCategory(slug) {
  try {
    const { data: category, error } = await supabaseAdmin
      .from('blog_categories')
      .select('id, name, slug, description, icon, color')
      .eq('slug', slug)
      .single()

    if (error || !category) {
      return null
    }

    return category
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

// Fetch posts for category
async function getPosts(categorySlug) {
  try {
    const { data: category } = await supabaseAdmin
      .from('blog_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (!category) return []

    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('categoryId', category.id)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return []
    }

    // Get reply count for each post
    const postsWithCounts = await Promise.all(
      (posts || []).map(async (post) => {
        const { count: replyCount } = await supabaseAdmin
          .from('blog_replies')
          .select('id', { count: 'exact', head: true })
          .eq('postId', post.id)

        return {
          ...post,
          replyCount: replyCount || 0
        }
      })
    )

    return postsWithCounts
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function CategoryDetailPage({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const category = await getCategory(slug)
  
  if (!category) {
    notFound()
  }

  const posts = await getPosts(slug)

  // Structured data for category
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: `https://minecraftserverlist.com/blog/${category.slug}`,
    about: {
      '@type': 'Thing',
      name: category.name,
      description: category.description
    },
    numberOfItems: posts.length
  }

  // Breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://minecraftserverlist.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://minecraftserverlist.com/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://minecraftserverlist.com/blog/${category.slug}`
      }
    ]
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData data={breadcrumbData} />

      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        {/* Header */}
        <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/blog" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 text-green-500" />
                <Gamepad2 className="w-8 h-8 text-green-500" />
                <div>
                  <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
                  <p className="text-xs text-gray-400">Blog & Forum</p>
                </div>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-gray-700">Ana Sayfa</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Category Header */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-8 mb-8" style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}>
              <div className="flex items-start gap-6">
                <div
                  className="w-20 h-20 rounded-lg flex items-center justify-center text-5xl flex-shrink-0"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-3">{category.name}</h2>
                  {category.description && (
                    <p className="text-gray-400 text-lg mb-4">{category.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {posts.length} Konu
                    </span>
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {posts.reduce((sum, post) => sum + (post.replyCount || 0), 0)} Mesaj
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Posts List */}
            {posts.length === 0 ? (
              <Card className="bg-[#0f0f0f] border-gray-800 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Henüz konu yok</h3>
                <p className="text-gray-400 mb-6">Bu kategoride henüz hiç konu oluşturulmamış.</p>
                <Link href="/admin/blog/posts/create">
                  <Button className="bg-green-600 hover:bg-green-700">
                    İlk Konuyu Oluştur
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/post/${post.slug}`}>
                    <Card className="bg-[#0f0f0f] border-gray-800 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10 p-6">
                      <article className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Post Icon/Status */}
                          <div className="flex-shrink-0">
                            {post.isPinned ? (
                              <Pin className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <BookOpen className="w-6 h-6 text-gray-500" />
                            )}
                          </div>

                          {/* Post Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold">{post.title}</h3>
                              {post.isPinned && (
                                <Badge className="bg-yellow-600 text-xs">Sabitlenmiş</Badge>
                              )}
                              {post.isLocked && (
                                <Badge variant="outline" className="border-gray-600 text-xs">Kilitli</Badge>
                              )}
                            </div>
                            {post.excerpt && (
                              <p className="text-gray-400 mb-3 line-clamp-2">{post.excerpt}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Yazar
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR') : 'Yeni'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {post.viewCount || 0} görüntüleme
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.replyCount || 0} yanıt
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
