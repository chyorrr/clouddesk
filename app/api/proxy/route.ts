import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let finalUrl = targetUrl
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = 'https://' + finalUrl
  }

  try {
    const res = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CloudDesk/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    })

    const contentType = res.headers.get('content-type') || 'text/html'
    
    // If HTML, inject base href so relative images, scripts, and CSS load correctly
    if (contentType.includes('text/html')) {
      let html = await res.text()
      const origin = new URL(finalUrl).origin
      const baseTag = `<base href="${finalUrl}" />`
      
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}`)
      } else if (html.includes('<head ')) {
        html = html.replace(/<head[^>]*>/, `$&${baseTag}`)
      } else {
        html = `${baseTag}${html}`
      }

      return new NextResponse(html, {
        status: res.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          // Omit X-Frame-Options and frame-ancestors CSP so iframe renders cleanly
        },
      })
    }

    // Binary / non-HTML content (images, json, text)
    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (err) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cannot connect</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #FFF; padding: 24px; color: #333; }
          h2 { color: #C00; }
          .card { border: 1px solid #CCC; background: #F8F8F8; padding: 16px; border-radius: 4px; max-width: 600px; }
          a.btn { display: inline-block; background: #000080; color: #FFF; text-decoration: none; padding: 6px 12px; margin-top: 12px; border-radius: 2px; }
        </style>
      </head>
      <body>
        <h2>🌐 Web Page Unavailable</h2>
        <div class="card">
          <p>Could not connect to <strong>${finalUrl}</strong>.</p>
          <p>The destination server may be offline, rate limiting requests, or blocking direct connections.</p>
          <a href="${finalUrl}" target="_blank" rel="noreferrer" class="btn">Open in External Browser ↗</a>
        </div>
      </body>
      </html>
    `
    return new NextResponse(errorHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}
