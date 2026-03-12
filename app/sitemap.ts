import { MetadataRoute } from 'next'

const BASE_URL = 'https://78onjean.co.za'

// ── Public website pages only (no dashboard/admin pages) ──
const publicRoutes = [
  { path: '/',         priority: 1.0,  changeFreq: 'daily'   },
  { path: '/rooms',    priority: 0.9,  changeFreq: 'daily'   },
  { path: '/book-now', priority: 0.9,  changeFreq: 'daily'   },
  { path: '/spa',      priority: 0.8,  changeFreq: 'weekly'  },
  { path: '/menu',     priority: 0.8,  changeFreq: 'weekly'  },
  { path: '/gallery',  priority: 0.7,  changeFreq: 'weekly'  },
  { path: '/contact',  priority: 0.7,  changeFreq: 'monthly' },
]

// ── Dynamic room pages ──
const roomSlugs = [
  'deluxe-double-room-with-bath',
  'deluxe-double-room',
  'deluxe-double-room-2',
  'deluxe-double-room-3',
  'deluxe-double-room-4',
  'family-double-room',
  'family-double-room-1',
]

// ── Supported locales ──
const locales = ['en', 'fr', 'it', 'es', 'nl']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // ── English public pages (root, no locale prefix) ──
  const englishPages: MetadataRoute.Sitemap = publicRoutes.map(({ path, priority, changeFreq }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: changeFreq as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority,
  }))

  // ── Localized public pages (fr, it, es, nl) ──
  const localizedPages: MetadataRoute.Sitemap = locales
    .filter(locale => locale !== 'en')
    .flatMap(locale =>
      publicRoutes.map(({ path, priority, changeFreq }) => ({
        url: `${BASE_URL}/${locale}${path === '/' ? '' : path}`,
        lastModified: now,
        changeFrequency: changeFreq as MetadataRoute.Sitemap[number]['changeFrequency'],
        priority: priority - 0.1, // slightly lower priority than English
      }))
    )

  // ── English room detail pages ──
  const englishRoomPages: MetadataRoute.Sitemap = roomSlugs.map(slug => ({
    url: `${BASE_URL}/rooms/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: 0.8,
  }))

  // ── Localized room detail pages ──
  const localizedRoomPages: MetadataRoute.Sitemap = locales
    .filter(locale => locale !== 'en')
    .flatMap(locale =>
      roomSlugs.map(slug => ({
        url: `${BASE_URL}/${locale}/rooms/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as MetadataRoute.Sitemap[number]['changeFrequency'],
        priority: 0.7,
      }))
    )

  // ── /cart and /booking are intentionally excluded ──
  // (transactional pages with no SEO value)

  // ── Dashboard pages are intentionally excluded ──
  // (private/admin pages should never be indexed by Google)

  return [
    ...englishPages,
    ...englishRoomPages,
    ...localizedPages,
    ...localizedRoomPages,
  ]
}