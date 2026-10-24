const CACHE_NAME = 'dao-dong-ky-offline-v1';
const urlsToCache = [
  './',
  './index.html',
  './icon.png'
];

// Lệnh 1: Cài đặt và tải ngầm toàn bộ dữ liệu (Code, Icon) vào ổ cứng máy tính/điện thoại
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Đã lưu Cache Offline thành công');
        return cache.addAll(urlsToCache);
      })
  );
});

// Lệnh 2: Bắt yêu cầu tải trang. Nếu mất mạng, tự động lấy dữ liệu từ ổ cứng ra chạy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu tìm thấy trong Cache thì dùng luôn, không thì tải từ Internet (nếu có mạng)
        return response || fetch(event.request);
      })
  );
});
