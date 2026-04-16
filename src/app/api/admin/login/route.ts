import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const secret = process.env.ADMIN_SECRET

  if (password === secret) {
    const response = NextResponse.json({ success: true })
    
    // Set a cookie that lasts for 7 days
    response.cookies.set('admin_session', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
