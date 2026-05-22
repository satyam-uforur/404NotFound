import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { uploadImage, isCloudinaryConfigured } from '@/lib/cloudinary'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = (formData.get('folder') as string) || '404notfound/products'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > 10) {
      return NextResponse.json({ error: 'Max 10 files at once' }, { status: 400 })
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 503 })
    }

    const results = []

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) continue
      if (file.size > MAX_FILE_SIZE) continue

      try {
        const result = await uploadImage(file, folder)
        results.push(result)
      } catch (err) {
        results.push({ error: (err as Error).message, filename: file.name })
      }
    }

    return NextResponse.json({ results }, { status: 201 })
  } catch (error) {
    console.error('[Upload Batch] Error:', error)
    return NextResponse.json({ error: 'Batch upload failed' }, { status: 500 })
  }
}
