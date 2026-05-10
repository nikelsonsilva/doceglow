import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'products';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Resolve store
    const { data: store } = await getSupabaseAdmin()
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Ensure bucket exists
    const { data: buckets } = await getSupabaseAdmin().storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET);
    if (!bucketExists) {
      await getSupabaseAdmin().storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Scoped path: stores/{store_id}/product_{timestamp}_{random}.jpg
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const sanitizedName = `product_${timestamp}_${random}.${ext}`;
      const storagePath = `stores/${store.id}/${sanitizedName}`;

      const { error: uploadError } = await getSupabaseAdmin().storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload error for ${file.name}:`, uploadError.message);
        continue;
      }

      const { data: urlData } = getSupabaseAdmin().storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      uploadedUrls.push(urlData.publicUrl);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
