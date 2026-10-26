// Service Worker - آلة حاسبة PWA
const CACHE_NAME = 'calculator-pwa-v1';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg'
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
    console.log('✅ Service Worker: جاري التثبيت');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Service Worker: تم تخزين الملفات');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// تفعيل Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: جاري التفعيل');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: حذف كاش قديم', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// جلب الملفات (من الكاش أو من الشبكة)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // لو الملف موجود في الكاش، رجعه
                if (response) {
                    return response;
                }
                // غير كده، جيبه من الشبكة
                return fetch(event.request)
                    .then((response) => {
                        // لو مش response صالح، رجعه زي ما هو
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // خزّن نسخة في الكاش
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    })
                    .catch(() => {
                        // لو النت فاصل، رجع صفحة أوفلاين
                        return caches.match('./index.html');
                    });
            })
    );
});
    );
});
