import { v2 as cloudinary } from 'cloudinary'

export function getCloudinaryConfig() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
  return cloudinary
}

export async function uploadImage(file: File, folder: string = '404notfound/products') {
  const cl = getCloudinaryConfig()

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return new Promise<{ url: string; public_id: string; width: number; height: number }>((resolve, reject) => {
    cl.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
          max_file_size: 5 * 1024 * 1024,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve({
            url: result!.secure_url,
            public_id: result!.public_id,
            width: result!.width,
            height: result!.height,
          })
        },
      )
      .end(buffer)
  })
}

export async function destroyImage(publicId: string) {
  const cl = getCloudinaryConfig()
  return cl.uploader.destroy(publicId)
}

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}
