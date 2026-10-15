// Nurri's Tracker service worker. build-public.py stamps BUILD to match the page, so every release is a new
// worker and a new cache. Cache-first shell; the shell is fetched with cache:"no-cache" so a new worker
// never caches a stale page from the CDN. The worker waits after install: the page applies it on the next
// load, or when the user taps "Update ready" (see registerSW in tracker.html).
const BUILD='2026-10-14-V1.3';
const CACHE='nurris-tracker-'+BUILD;
const SHELL=['./','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'no-cache'})))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.indexOf('nurris-tracker-')===0&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  const nav=r.mode==='navigate';
  e.respondWith(caches.open(CACHE).then(c=>c.match(nav?'./':r,{ignoreSearch:true}).then(hit=>hit||(nav?fetch(r):fetch(r,{cache:'no-cache'})))));
});
