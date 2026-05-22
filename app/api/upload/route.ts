import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { uploadImage, destroyImage, isCloudinaryConfigured } from '@/lib/cloudinary'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || '404notfound/products'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 })
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: 'Cloudinary not configured. Use URL input instead.' }, { status: 503 })
    }

    const result = await uploadImage(file, folder)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { public_id } = await request.json()
    if (!public_id) {
      return NextResponse.json({ error: 'public_id required' }, { status: 400 })
    }

    if (isCloudinaryConfigured()) {
      await destroyImage(public_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Upload] Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
