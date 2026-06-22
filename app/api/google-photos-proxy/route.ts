import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route: downloads a Google Photos image server-side (avoids CORS)
 * and streams it back as a binary response.
 *
 * POST /api/google-photos-proxy
 * Body: { url: string }
 * Headers: Authorization: Bearer <access_token>
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    // Download the image server-side (no CORS restrictions here)
    const imgRes = await fetch(url, {
      headers: { Authorization: authHeader },
    });

    if (!imgRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imgRes.status} ${imgRes.statusText}` },
        { status: imgRes.status }
      );
    }

    const blob = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': blob.byteLength.toString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
