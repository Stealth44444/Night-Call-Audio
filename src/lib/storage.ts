const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export function getPublicUrl(path: string | null, bucket: string = 'products'): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}
