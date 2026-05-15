-- Add images JSONB array column to products for storing multiple image URLs
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT NULL;
-- Format: ["url1", "url2", "url3"]
