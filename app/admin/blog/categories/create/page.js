'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function CreateCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '📁',
    color: '#22c55e',
    position: 0
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : {})
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.name || !form.slug) {
      toast.error('Name and slug are required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Category created successfully!')
        router.push('/admin/blog')
      } else {
        const errorMessage = data.details || data.error || 'Failed to create category'
        toast.error(errorMessage)
        console.error('Category creation error:', data)
      }
    } catch (error) {
      console.error('Category creation error:', error)
      toast.error('Error creating category: ' + (error.message || 'Unknown error'))
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
        <h1 className="text-3xl font-bold">Create Category</h1>
      </div>

      <Card className="bg-gray-900 border-gray-800 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Guides"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="e.g., guides"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Category description..."
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input
                id="icon"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                type="color"
                value={form.color}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                type="number"
                value={form.position}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Create Category</>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
