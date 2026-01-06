'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function CreatePostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: '',
    isPinned: false,
    isLocked: false
  })

  useEffect(() => {
    checkAuth()
    fetchCategories()
  }, [])

  const checkAuth = async () => {
    const supabase = createBrowserSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : {})
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.title || !form.content || !form.categoryId) {
      toast.error('Title, content and category are required')
      return
    }

    if (!user) {
      toast.error('You must be logged in')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          userId: user.id,
          tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Post created successfully!')
        router.push('/admin/blog')
      } else {
        const errorMessage = data.details || data.error || 'Failed to create post'
        toast.error(errorMessage)
        console.error('Post creation error:', data)
      }
    } catch (error) {
      console.error('Post creation error:', error)
      toast.error('Error creating post: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Post</h1>
      </div>

      <Card className="bg-gray-900 border-gray-800 p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Post title"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="post-slug"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Select
              value={form.categoryId}
              onValueChange={(val) => setForm(prev => ({ ...prev, categoryId: val }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              placeholder="Brief summary of the post..."
              className="bg-gray-800 border-gray-700"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content * (Markdown supported)</Label>
            <Textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Write your post content here..."
              className="bg-gray-800 border-gray-700 font-mono"
              rows={12}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="minecraft, guide, tips"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Switch
                id="isPinned"
                checked={form.isPinned}
                onCheckedChange={(val) => setForm(prev => ({ ...prev, isPinned: val }))}
              />
              <Label htmlFor="isPinned">Pin to top</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isLocked"
                checked={form.isLocked}
                onCheckedChange={(val) => setForm(prev => ({ ...prev, isLocked: val }))}
              />
              <Label htmlFor="isLocked">Lock comments</Label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Publish Post</>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
