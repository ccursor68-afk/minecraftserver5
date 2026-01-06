import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import CategoryList from '@/components/blog/CategoryList'
import StructuredData from '@/components/blog/StructuredData'
import { supabaseAdmin } from '@/lib/supabase'

// SEO Metadata
export async function generateMetadata() {
  return {
    title: 'Minecraft Server Blog & Forum | En İyi MC Rehberleri ve İpuçları - 2025',
    description: 'Minecraft server kurulumu, mod rehberleri, PvP taktikleri, building ipuçları ve daha fazlası. Türkçe ve İngilizce Minecraft topluluk forumu.',
    keywords: [
      'minecraft blog',
      'minecraft forum',
      'minecraft rehber',
      'minecraft server',
      'minecraft ipuçları',
      'mc server kurulumu',
      'minecraft mods',
      'minecraft building',
      'minecraft pvp',
      'minecraft survival',
      'minecraft türkçe',
      'minecraft guides',
      'minecraft tips',
      'minecraft community'
    ],
    authors: [{ name: 'Minecraft Server List' }],
    openGraph: {
      title: 'Minecraft Server Blog & Forum | En İyi MC Rehberleri 2025',
      description: 'Minecraft server kurulumu, mod rehberleri, PvP taktikleri ve daha fazlası. Türkçe ve İngilizce topluluk forumu.',
      type: 'website',
      locale: 'tr_TR',
      alternateLocale: ['en_US'],
      siteName: 'Minecraft Server List Blog',
      images: [
        {
          url: 'https://via.placeholder.com/1200x630/22c55e/ffffff?text=Minecraft+Blog',
          width: 1200,
          height: 630,
          alt: 'Minecraft Server List Blog'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Minecraft Server Blog & Forum',
      description: 'En iyi Minecraft rehberleri, ipuçları ve topluluk forumu',
      images: ['https://via.placeholder.com/1200x630/22c55e/ffffff?text=Minecraft+Blog']
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
    },
    alternates: {
      canonical: '/blog',
      languages: {
        'tr-TR': '/blog',
        'en-US': '/blog'
      }
    }
  }
}

// Server-side data fetching
async function getCategories() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('blog_categories')
      .select('id, name, slug, description, icon, color')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    
    // For each category, count posts and replies
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count: postCount } = await supabaseAdmin
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .eq('categoryId', category.id)
        
        const { data: posts } = await supabaseAdmin
          .from('blog_posts')
          .select('id')
          .eq('categoryId', category.id)
        
        let replyCount = 0
        if (posts && posts.length > 0) {
          const postIds = posts.map(p => p.id)
          const { count } = await supabaseAdmin
            .from('blog_replies')
            .select('id', { count: 'exact', head: true })
            .in('postId', postIds)
          replyCount = count || 0
        }
        
        return {
          ...category,
          topicCount: postCount || 0,
          postCount: replyCount || 0
        }
      })
    )
    
    return categoriesWithCounts
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export default async function BlogPage() {
  const categories = await getCategories()

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Minecraft Server Blog & Forum',
    description: 'Minecraft server kurulumu, mod rehberleri, PvP taktikleri ve topluluk forumu',
    url: 'https://minecraftserverlist.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Minecraft Server List',
      logo: {
        '@type': 'ImageObject',
        url: 'https://minecraftserverlist.com/logo.png'
      }
    },
    inLanguage: ['tr-TR', 'en-US'],
    about: {
      '@type': 'Thing',
      name: 'Minecraft',
      description: 'Gaming community and server information'
    }
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
              <Link href="/" className="flex items-center gap-2">
                <Gamepad2 className="w-8 h-8 text-green-500" />
                <div>
                  <h1 className="text-2xl font-bold text-green-500">MINECRAFT SERVER LIST</h1>
                  <p className="text-xs text-gray-400">Blog & Forum</p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <Link href="/">
                  <Button variant="outline" className="border-gray-700">Ana Sayfa</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                📰 Minecraft Blog & Forum
              </h2>
              <p className="text-xl text-gray-400 mb-6">
                Rehberler, ipuçları ve topluluk tartışmaları
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
              </div>
            ) : (
              <CategoryList categories={categories} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
