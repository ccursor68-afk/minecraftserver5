'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export default function AdminBlogPage() {
  const [categories, setCategories] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [catRes, postRes] = await Promise.all([
        fetch('/api/blog/categories'),
        fetch('/api/blog/posts')
      ])

      if (catRes.ok) {
        const cats = await catRes.json()
        setCategories(cats)
      }

      if (postRes.ok) {
        const posts = await postRes.json()
        setPosts(posts)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`"${categoryName}" kategorisini silmek istediğinizden emin misiniz? Bu kategorideki tüm postlar da silinecek!`)) {
      return
    }

    setDeleting(`cat-${categoryId}`)
    try {
      const response = await fetch(`/api/blog/categories?id=${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Kategori başarıyla silindi')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Kategori silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Kategori silinirken hata oluştu')
    } finally {
      setDeleting(null)
    }
  }

  const deletePost = async (postId, postTitle) => {
    if (!confirm(`"${postTitle}" postunu silmek istediğinizden emin misiniz?`)) {
      return
    }

    setDeleting(`post-${postId}`)
    try {
      const response = await fetch(`/api/blog/posts?id=${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Post başarıyla silindi')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Post silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Post silinirken hata oluştu')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <div className="flex gap-2">
          <Link href="/admin/blog/categories/create">
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </Link>
          <Link href="/admin/blog/posts/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Categories ({categories.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Card key={cat.id} className="bg-gray-900 border-gray-800 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold">{cat.name}</h3>
                        <p className="text-sm text-gray-400">{cat.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategory(cat.id, cat.name)}
                      disabled={deleting === `cat-${cat.id}`}
                      className="text-red-500 hover:text-red-600 hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Posts ({posts.length})</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-gray-900 border-gray-800 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-400">{post.excerpt}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePost(post.id, post.title)}
                      disabled={deleting === `post-${post.id}`}
                      className="text-red-500 hover:text-red-600 hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
