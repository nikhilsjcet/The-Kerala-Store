import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Custom Vite server plugin to extract Meesho product data bypassing browser CORS
function meeshoExtractorPlugin(): Plugin {
  return {
    name: 'meesho-extractor-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/extract-meesho')) {
          try {
            const parsedUrl = new URL(req.url, 'http://localhost:3000');
            const target = parsedUrl.searchParams.get('url');

            if (!target) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Missing target url parameter' }));
              return;
            }

            const cleanTarget = target.trim().startsWith('http') ? target.trim() : `https://${target.trim()}`;

            const response = await fetch(cleanTarget, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept':
                  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
              },
              redirect: 'follow',
            });

            if (!response.ok) {
              res.statusCode = response.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: `Meesho responded with HTTP ${response.status}` }));
              return;
            }

            const html = await response.text();

            let title = '';
            let price = 0;
            let originalPrice = 0;
            let description = '';
            const images: string[] = [];
            const reviews: any[] = [];
            const specifications: Record<string, string> = {};

            // 1. Try __NEXT_DATA__
            const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
            if (nextDataMatch && nextDataMatch[1]) {
              try {
                const nextData = JSON.parse(nextDataMatch[1]);
                const pageProps = nextData?.props?.pageProps;
                const product =
                  pageProps?.initialState?.product?.product ||
                  pageProps?.initialState?.product ||
                  pageProps?.product ||
                  pageProps?.data?.product;

                if (product) {
                  if (product.name) title = product.name;
                  if (product.description) description = product.description;
                  if (product.discounted_price || product.price) {
                    price = Number(product.discounted_price || product.price);
                  }
                  if (product.original_price || product.mrp) {
                    originalPrice = Number(product.original_price || product.mrp);
                  }

                  // Images in Next Data
                  if (Array.isArray(product.images)) {
                    for (const img of product.images) {
                      if (typeof img === 'string') images.push(img);
                      else if (img?.url) images.push(img.url);
                    }
                  } else if (Array.isArray(product.product_images)) {
                    for (const img of product.product_images) {
                      if (typeof img === 'string') images.push(img);
                      else if (img?.url) images.push(img.url);
                    }
                  }

                  // Reviews in Next Data
                  const rawReviews = product.reviews || product.product_reviews || pageProps?.reviews;
                  if (Array.isArray(rawReviews)) {
                    rawReviews.slice(0, 5).forEach((r: any, idx: number) => {
                      reviews.push({
                        id: `rev-${Date.now()}-${idx}`,
                        author: r.user_name || r.author || r.customer_name || 'Verified Buyer',
                        location: 'Kerala, India',
                        rating: Number(r.rating || r.reviewRating?.ratingValue || 5),
                        date: r.created_at || 'Verified Purchase',
                        comment: r.comment || r.description || r.reviewBody || 'Good quality product, matches Meesho listing.',
                        verified_purchase: true,
                      });
                    });
                  }
                }
              } catch {
                // Ignore Next data parse failure
              }
            }

            // 2. Try JSON-LD structured data
            const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
            for (const script of jsonLdMatches) {
              try {
                const jsonStr = script.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
                const ld = JSON.parse(jsonStr);
                if (!title && ld.name) title = ld.name;
                if (!description && ld.description) description = ld.description;
                if (price === 0 && ld.offers?.price) price = Math.round(Number(ld.offers.price));
                if (ld.image) {
                  if (Array.isArray(ld.image)) images.push(...ld.image);
                  else if (typeof ld.image === 'string') images.push(ld.image);
                }
                if (reviews.length === 0 && Array.isArray(ld.review)) {
                  ld.review.slice(0, 5).forEach((r: any, idx: number) => {
                    reviews.push({
                      id: `rev-${Date.now()}-${idx}`,
                      author: r.author?.name || 'Verified Buyer',
                      location: 'Kerala, India',
                      rating: Number(r.reviewRating?.ratingValue) || 5,
                      date: 'Verified Buyer',
                      comment: r.reviewBody || 'Very happy with the product quality.',
                      verified_purchase: true,
                    });
                  });
                }
              } catch {
                // Continue
              }
            }

            // 3. OpenGraph tags
            if (!title) {
              const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
              if (ogTitle && ogTitle[1]) {
                title = ogTitle[1].replace(/\|\s*Meesho.*$/i, '').replace(/-\s*Buy\s+.*Meesho/i, '').trim();
              }
            }
            if (!description) {
              const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
              if (ogDesc && ogDesc[1]) {
                description = ogDesc[1].trim();
              }
            }
            const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
            if (ogImg && ogImg[1]) {
              images.push(ogImg[1]);
            }

            // 4. Regex search for Meesho CDN images
            const meeshoCdnMatches = html.match(/https?:\/\/images\.meesho\.com\/images\/products\/[a-zA-Z0-9_\-\.\/]+\.(?:jpg|jpeg|png|webp)/gi) || [];
            images.push(...meeshoCdnMatches);

            // 5. Clean up unique images
            const uniqueImages = Array.from(new Set(images.filter((img) => img && img.startsWith('http')))).slice(0, 10);

            // 6. Regex search for price if still 0
            if (price === 0) {
              const priceMatch = html.match(/₹\s*([0-9]{2,5})/);
              if (priceMatch && priceMatch[1]) {
                price = parseInt(priceMatch[1], 10);
              }
            }

            // Categorization
            let categorySlug = 'fashion';
            const lower = `${title} ${description}`.toLowerCase();
            if (lower.includes('earbud') || lower.includes('headphone') || lower.includes('speaker') || lower.includes('smartwatch') || lower.includes('audio') || lower.includes('bluetooth') || lower.includes('charger') || lower.includes('cable') || lower.includes('drone')) {
              categorySlug = 'electronics';
            } else if (lower.includes('kitchen') || lower.includes('cookware') || lower.includes('chopper') || lower.includes('pan') || lower.includes('bottle') || lower.includes('knife') || lower.includes('container') || lower.includes('spice')) {
              categorySlug = 'home-kitchen';
            } else if (lower.includes('saree') || lower.includes('kurti') || lower.includes('shirt') || lower.includes('dress') || lower.includes('tshirt') || lower.includes('pant') || lower.includes('cloth') || lower.includes('suit')) {
              categorySlug = 'fashion';
            } else if (lower.includes('oil') || lower.includes('cream') || lower.includes('serum') || lower.includes('glow') || lower.includes('skin') || lower.includes('hair') || lower.includes('beauty') || lower.includes('ayurvedic')) {
              categorySlug = 'beauty-care';
            } else if (lower.includes('car') || lower.includes('bike') || lower.includes('vacuum') || lower.includes('vehicle') || lower.includes('tyre') || lower.includes('mount')) {
              categorySlug = 'automotive';
            } else if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout') || lower.includes('yoga') || lower.includes('dumbbell') || lower.includes('band')) {
              categorySlug = 'sports-fitness';
            } else if (lower.includes('game') || lower.includes('toy') || lower.includes('console') || lower.includes('puzzle') || lower.includes('kids') || lower.includes('doll')) {
              categorySlug = 'toys-games';
            } else if (lower.includes('wallet') || lower.includes('bag') || lower.includes('watch') || lower.includes('sunglass') || lower.includes('belt') || lower.includes('jewel')) {
              categorySlug = 'accessories';
            } else {
              categorySlug = 'home-essentials';
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                title: title || 'New Meesho Dropship Product',
                price: price || 299,
                original_price: originalPrice || (price ? Math.round(price * 1.5) : 599),
                images: uniqueImages,
                description: description || '',
                reviews,
                category_slug: categorySlug,
                specifications,
              })
            );
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Extraction failed' }));
          }
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), meeshoExtractorPlugin()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});

