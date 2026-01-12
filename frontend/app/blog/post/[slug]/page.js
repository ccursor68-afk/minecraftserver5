import Link from 'next/link'
import { Gamepad2, ArrowLeft, MessageSquare, Clock, User, Eye, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import StructuredData from '@/components/blog/StructuredData'
import { RenderWithHashtags, extractHashtags, HashtagBadges } from '@/components/blog/HashtagUtils'
import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  try {
    const { data: post } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!post) {
      return {
        title: 'Post Bulunamadı - Minecraft Server List Blog',
        description: 'Aradığınız post bulunamadı.'
      }
    }

    // Get category info
    const { data: category } = await supabaseAdmin
      .from('blog_categories')
      .select('name')
      .eq('id', post.categoryId)
      .single()

    const categoryName = category?.name || 'Minecraft'

    return {
      title: `${post.title} | ${categoryName} - Minecraft Server Blog`,
      description: post.excerpt || post.content.substring(0, 160),
      keywords: [
        ...(post.tags || []),
        'minecraft',
        categoryName.toLowerCase(),
        'minecraft rehber',
        'minecraft guide',
        'minecraft forum',
        'minecraft tips'
      ],
      authors: [{ name: 'Minecraft Server List' }],
      openGraph: {
        title: post.title,
        description: post.excerpt || post.content.substring(0, 160),
        type: 'article',
        locale: 'tr_TR',
        alternateLocale: ['en_US'],
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt || post.createdAt,
        section: categoryName,
        tags: post.tags || [],
        images: [
          {
            url: 'https://via.placeholder.com/1200x630/22c55e/ffffff?text=' + encodeURIComponent(post.title.substring(0, 50)),
            width: 1200,
            height: 630,
            alt: post.title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.content.substring(0, 160),
        images: ['https://via.placeholder.com/1200x630/22c55e/ffffff?text=' + encodeURIComponent(post.title.substring(0, 50))]
      },
      alternates: {
        canonical: `/blog/post/${slug}`,
        languages: {
          'tr-TR': `/blog/post/${slug}`,
          'en-US': `/blog/post/${slug}`
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

// Fetch post data
async function getPost(slug) {
  try {
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !post) {
      return null
    }

    // Increment view count
    await supabaseAdmin
      .from('blog_posts')
      .update({ viewCount: (post.viewCount || 0) + 1 })
      .eq('id', post.id)

    // Get post replies
    const { data: replies } = await supabaseAdmin
      .from('blog_replies')
      .select('*')
      .eq('postId', post.id)
      .order('createdAt', { ascending: true })

    // Get category
    const { data: category } = await supabaseAdmin
      .from('blog_categories')
      .select('name, slug')
      .eq('id', post.categoryId)
      .single()

    return {
      ...post,
      viewCount: (post.viewCount || 0) + 1,
      replies: replies || [],
      category
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function PostDetailPage({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  // Article structured data
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    image: `https://via.placeholder.com/1200x630/22c55e/ffffff?text=${encodeURIComponent(post.title.substring(0, 50))}`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@type': 'Organization',
      name: 'Minecraft Server List'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Minecraft Server List',
      logo: {
        '@type': 'ImageObject',
        url: 'https://minecraftserverlist.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://minecraftserverlist.com/blog/post/${slug}`
    },
    articleSection: post.category?.name || 'Minecraft',
    keywords: (post.tags || []).join(', '),
    wordCount: post.content.split(' ').length,
    commentCount: post.replies?.length || 0,
    inLanguage: 'tr-TR'
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
      ...(post.category ? [{
        '@type': 'ListItem',
        position: 3,
        name: post.category.name,
        item: `https://minecraftserverlist.com/blog/${post.category.slug}`
      }] : []),
      {
        '@type': 'ListItem',
        position: post.category ? 4 : 3,
        name: post.title,
        item: `https://minecraftserverlist.com/blog/post/${slug}`
      }
    ]
  }

  return (
    <>
      <StructuredData data={articleData} />
      <StructuredData data={breadcrumbData} />

      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        {/* Header */}
        <header className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={post.category ? `/blog/${post.category.slug}` : '/blog'} className="text-gray-400 hover:text-green-500">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link href="/blog" className="flex items-center gap-3">
                  <img src="/logo.png" alt="ServerListRank" className="w-11 h-11 object-contain" />
                  <div>
                    <h1 className="text-2xl font-bold text-green-500">ServerListRank</h1>
                    <p className="text-xs text-gray-400">Blog & Forum</p>
                  </div>
                </Link>
              </div>
              <Link href="/">
                <Button variant="outline" className="border-gray-700">Ana Sayfa</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Post Header */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-8 mb-6">
              <article>
                {/* Title with hashtags */}
                <h2 className="text-4xl font-bold mb-4">
                  <RenderWithHashtags text={post.title} />
                </h2>
                
                {/* Post Meta */}
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Yazar
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <time dateTime={post.createdAt}>
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Yeni'}
                    </time>
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {post.viewCount || 0} görüntüleme
                  </span>
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {post.replies?.length || 0} yanıt
                  </span>
                </div>

                {/* Tags from database */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mb-6">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <HashtagBadges hashtags={post.tags} />
                  </div>
                )}

                {/* Excerpt with hashtags */}
                {post.excerpt && (
                  <div className="bg-gray-900 border-l-4 border-green-500 p-4 rounded mb-6">
                    <p className="text-gray-300 italic">
                      <RenderWithHashtags text={post.excerpt} />
                    </p>
                  </div>
                )}
              </article>
            </Card>

            {/* Post Content */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-8 mb-6">
              <div className="prose prose-invert prose-green max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </Card>

            {/* Replies Section */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-green-500" />
                Yorumlar ({post.replies?.length || 0})
              </h3>

              {post.replies && post.replies.length > 0 ? (
                <div className="space-y-4">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>Kullanıcı</span>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <time dateTime={reply.createdAt}>
                          {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('tr-TR') : 'Yeni'}
                        </time>
                      </div>
                      <p className="text-gray-300">{reply.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Henüz yorum yok. İlk yorumu siz yapın!</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
