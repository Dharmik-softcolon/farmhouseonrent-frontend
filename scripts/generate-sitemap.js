// scripts/generate-sitemap.js
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://farmhouseonrent.in';
const API_URL = 'https://api.farmhouseonrent.in';

// ─── Helper: escape XML ───
const escapeXml = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

// ─── Helper: build URL block ───
const buildUrl = ({ loc, lastmod, changefreq, priority, images = [] }) => {
    let block = `
  <url>
    <loc>${escapeXml(loc)}</loc>`;

    if (lastmod) {
        block += `\n    <lastmod>${lastmod}</lastmod>`;
    }

    block += `
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

    images.forEach(img => {
        if (img && img.startsWith('http')) {
            block += `
    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
    </image:image>`;
        }
    });

    block += `\n  </url>`;
    return block;
};

// ─── Helper: fetch with timeout ───
const fetchData = (url) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const request = client.get(url, { timeout: 15000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });
        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
};

// ─── Main function ───
async function generateSitemap() {
    const today = new Date().toISOString().split('T')[0];
    const outputPath = path.join(__dirname, '../dist/sitemap.xml');

    try {
        console.log('📡 Fetching sitemap data from API...');
        console.log(`   URL: ${API_URL}/sitemap-data`);

        const data = await fetchData(`${API_URL}/sitemap-data`);

        if (!data.success) {
            throw new Error('API returned unsuccessful response');
        }

        const { farmhouses = [], cities = [], suratSubLocations = [] } = data;

        console.log(`✅ Data received:`);
        console.log(`   Farmhouses: ${farmhouses.length}`);
        console.log(`   Cities: ${cities.length} → ${cities.join(', ')}`);
        console.log(`   SubLocations: ${suratSubLocations.length}`);

        // ── Build XML ──
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

        // 1. Homepage
        xml += buildUrl({
            loc: `${SITE_URL}/`,
            lastmod: today,
            changefreq: 'daily',
            priority: '1.0',
        });

        // 2. All farmhouses page
        xml += buildUrl({
            loc: `${SITE_URL}/farmhouses`,
            lastmod: today,
            changefreq: 'daily',
            priority: '0.9',
        });

        // 3. City pages
        cities.forEach(city => {
            xml += buildUrl({
                loc: `${SITE_URL}/farmhouses?city=${encodeURIComponent(city)}`,
                lastmod: today,
                changefreq: 'weekly',
                priority: '0.8',
            });
        });

        // 4. Surat sub-location pages
        suratSubLocations.forEach(subLoc => {
            xml += buildUrl({
                loc: `${SITE_URL}/farmhouses?city=Surat&subLocation=${encodeURIComponent(subLoc)}`,
                lastmod: today,
                changefreq: 'weekly',
                priority: '0.7',
            });
        });

        // 5. Individual farmhouse pages
        farmhouses.forEach(farm => {
            const lastmod = farm.updatedAt
                ? new Date(farm.updatedAt).toISOString().split('T')[0]
                : today;

            xml += buildUrl({
                loc: `${SITE_URL}/farmhouse/${farm.slug || farm.id}`,
                lastmod,
                changefreq: 'weekly',
                priority: '0.7',
                images: (farm.images || []).slice(0, 5),
            });
        });

        xml += `\n</urlset>`;

        // ── Write file ──
        fs.writeFileSync(outputPath, xml, 'utf-8');

        const totalUrls = 2 + cities.length + suratSubLocations.length + farmhouses.length;
        console.log(`\n✅ sitemap.xml generated successfully!`);
        console.log(`📊 Total URLs: ${totalUrls}`);
        console.log(`📁 Output: ${outputPath}`);

    } catch (error) {
        console.error(`\n❌ API fetch failed: ${error.message}`);
        console.log('⚠️  Creating fallback static sitemap...\n');

        // ── Fallback sitemap ──
        const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/farmhouses</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

        fs.writeFileSync(outputPath, fallback, 'utf-8');
        console.log('✅ Fallback sitemap created with 2 URLs');
        console.log('⚠️  Run again after API is available for full sitemap');
    }
}

generateSitemap();