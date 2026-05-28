import { NextResponse } from 'next/server';
import { BUNDLED_CONTENT } from '@/lib/content';

// The "remote" content endpoint. In production this would be a CDN/JSON the app
// pulls daily; here it mirrors the bundled content so the sync path is real.
// Point NEXT_PUBLIC_CONTENT_URL at this route (or a CDN) to enable remote pull.
// TODO(decision): pick the cheapest host that ships (CDN vs managed) for v1.
export function GET() {
  return NextResponse.json(BUNDLED_CONTENT);
}
