// แก้โค้ดหน้าเว็บเมื่อไร ให้เปลี่ยนเลขเวอร์ชันนี้ เพื่อให้เครื่องผู้ใช้โหลดไฟล์ใหม่
const CACHE = 'pos-v4';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // ข้อมูลจาก Google Apps Script ต้องไปที่เน็ตเสมอ ห้าม cache
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // หน้าเว็บ: ลองโหลดจากเน็ตก่อน ถ้าออฟไลน์ใช้ไฟล์ใน cache
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
