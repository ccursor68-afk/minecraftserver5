import { NextResponse } from 'next/server'
import { createServerSupabaseClient, supabaseAdmin } from '../../../../lib/supabase.js'

// POST /api/profile/change-password - Change user password
export async function POST(request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { currentPassword, newPassword } = body
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Geçerli şifre ve yeni şifre gerekli' }, { status: 400 })
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalı' }, { status: 400 })
    }
    
    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })
    
    if (signInError) {
      return NextResponse.json({ error: 'Mevcut şifre yanlış' }, { status: 400 })
    }
    
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ error: 'Şifre güncellenirken hata oluştu' }, { status: 500 })
    }
    
    // Log activity
    await supabaseAdmin
      .from('user_activity')
      .insert([{
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        activityType: 'profile_update',
        description: 'Şifre değiştirildi'
      }])
    
    return NextResponse.json({ success: true, message: 'Şifre başarıyla güncellendi' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}