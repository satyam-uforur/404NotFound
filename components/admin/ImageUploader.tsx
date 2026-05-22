'use client'

import { useCallback, useState, useRef } from 'react'
import { Upload, X, GripVertical, Loader2, AlertCircle } from 'lucide-react'

interface UploadedImage {
  url: string
  public_id?: string
  file?: File
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  max?: number
  folder?: string
}

export function ImageUploader({ images, onChange, max = 10, folder = '404notfound/products' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    const key = file.name
    setProgress(p => ({ ...p, [key]: 0 }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 503) {
          return { url: URL.createObjectURL(file) }
        }
        throw new Error(data.error || 'Upload failed')
      }

      const result = await res.json()
      setProgress(p => ({ ...p, [key]: 100 }))
      return { url: result.url, public_id: result.public_id }
    } catch (err) {
      setErrors(e => [...e, `${file.name}: ${(err as Error).message}`])
      return null
    }
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .filter(f => f.size <= 5 * 1024 * 1024)
      .slice(0, max - images.length)

    if (validFiles.length === 0) return

    setUploading(true)
    setErrors([])

    const results: UploadedImage[] = []
    for (const file of validFiles) {
      const result = await uploadFile(file)
      if (result) results.push(result)
    }

    onChange([...images, ...results])
    setUploading(false)
    setProgress({})
  }, [images, onChange, max])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeImage = (index: number) => {
    const removed = images[index]
    if (removed.public_id) {
      fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: removed.public_id }),
      }).catch(() => {})
    }
    onChange(images.filter((_, i) => i !== index))
  }

  const moveImage = (from: number, to: number) => {
    const newImages = [...images]
    const [moved] = newImages.splice(from, 1)
    newImages.splice(to, 0, moved)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border border-dashed p-8 text-center cursor-pointer transition-all ${
          dragOver ? 'border-black/30 bg-black/5' : 'border-black/10 hover:border-black/20'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Upload size={20} className="mx-auto text-black/20 mb-3" />
        <p className="text-xs text-black/40">Drag & drop images or click to browse</p>
        <p className="text-[10px] text-black/20 mt-1">JPG, PNG, WebP, GIF — Max 5MB each — {max} max</p>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-red-500/80">
              <AlertCircle size={12} />
              {err}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <div key={img.url + i} className="group relative aspect-square border border-black/10 bg-black/5 overflow-hidden">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                  className="p-1.5 bg-red-500/80 text-white rounded"
                >
                  <X size={12} />
                </button>
              </div>
              {i > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); moveImage(i, i - 1) }}
                  className="absolute top-1 left-1 p-1 bg-white/80 text-black/60 hover:text-black"
                >
                  <GripVertical size={10} />
                </button>
              )}
              {progress[img.url] !== undefined && progress[img.url] < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                  <div className="h-full bg-black/40" style={{ width: `${progress[img.url]}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-xs text-black/40">
          <Loader2 size={12} className="animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  )
}
