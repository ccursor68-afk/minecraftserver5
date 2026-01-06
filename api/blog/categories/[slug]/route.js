import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase.js'

export async function GET(request, { params }) {
  const { slug } = params
  
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}