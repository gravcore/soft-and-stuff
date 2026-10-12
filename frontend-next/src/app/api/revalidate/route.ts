import { env } from '@/config/env';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Backend call this to invalidate the products cache
export async function POST(request: NextRequest) {
    const secret = request.headers.get('x-revalidate-secret');
    if (secret !== env.REVALIDATE_SECRET) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

    const { slug } = await request.json(); // request body with the product slug
    if (!slug) return NextResponse.json({ message: 'SLUG_MISSING' }, { status: 400 });

    revalidateTag(`product-${slug}`, { expire: 0 }); // invalidate product detail of this product inmediately
    revalidateTag('products', { expire: 0 });

    return NextResponse.json({
        revalidated: true,
        slug,
        now: Date.now(),
    });
}
