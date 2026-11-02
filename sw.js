// Nurri's Tracker service worker. build-public.py stamps BUILD to match the page, so every release is a new
// worker and a new cache. Cache-first shell; the shell is fetched with cache:"no-cache" so a new worker
// never caches a stale page from the CDN. The worker waits after install: the page applies it on the next
// open, or when the user taps "Update ready" (see registerSW in tracker.html).
// Only page loads and the shell files are answered here; every other request goes straight to the network.
// A request this worker is still answering holds back the next version's takeover (Chromium and WebKit both
// wait for it), so the worker never keeps one open (V2.1).
const BUILD='2026-11-01-V3';
const CACHE='nurris-tracker-'+BUILD;
const SHELL=['./','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','icon-maskable-512.png'];
const SHELL_URLS=new Set(SHELL.map(u=>new URL(u,location).href));
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'no-cache'})))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.indexOf('nurris-tracker-')===0&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')e.waitUntil(self.skipWaiting());});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);u.search='';u.hash='';
  const nav=r.mode==='navigate';
  if(r.method!=='GET'||u.origin!==location.origin||(!nav&&!SHELL_URLS.has(u.href)))return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(nav?'./':r,{ignoreSearch:true}).then(hit=>hit||(nav?fetch(r):fetch(r,{cache:'no-cache'})))));
});
