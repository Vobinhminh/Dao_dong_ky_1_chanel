const CACHE_NAME = 'dao-dong-ky-auto-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icon.png'
];

// 1. Cài đặt và lưu sẵn các tệp cốt lõi vào bộ nhớ đệm (Offline)
self.addEventListener('install', event => {
  self.skipWaiting(); // Kích hoạt ngay phiên bản mới không cần chờ
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Một số tài nguyên chưa thể lưu cache lúc cài đặt:', err);
      });
    })
  );
});

// 2. Dọn dẹp bộ nhớ đệm cũ và chiếm quyền kiểm soát ngay lập tức
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Chiến lược Network-First: Ưu tiên tải bản mới nhất từ mạng, mất mạng thì dùng bản lưu Offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.protocol !== 'http:' && requestUrl.protocol !== 'https:') return;
  if (requestUrl.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then(networkResponse => {
        // Nếu tải từ mạng thành công -> Tự động cập nhật đè bản mới nhất vào Cache Offline
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Khi mất mạng (Offline) -> Lấy bản đã lưu gần nhất trong ổ cứng ra chạy
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});
