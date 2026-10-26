// Marsbohrer III – Offline-Speicher. Bei jeder neuen Version CACHE hochzählen.
const CACHE='marsbohrer3-v5';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
const put=(req,res)=>{ if(res&&(res.ok||res.type==='opaque')){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return res; };
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin===self.location.origin){
    // Spielseite: zuerst Internet (für Updates), sonst gespeicherte Version
    if(req.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname.endsWith('/')){
      e.respondWith(fetch(req).then(r=>put(req,r)).catch(()=>caches.match(req).then(m=>m||caches.match('./index.html'))));
      return;
    }
    e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>put(req,r))));
    return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>put(req,r)).catch(()=>m)));
  }
});
