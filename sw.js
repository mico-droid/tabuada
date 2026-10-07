// Service worker: permite instalar o app e abrir offline.
// Ao mudar qualquer arquivo do jogo, aumente CACHE (v5 -> v6) para os aparelhos pegarem a versão nova.
const CACHE='tabuada-v5';
const FILES=['./','index.html','manifest.json','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
// um arquivo ausente NÃO pode derrubar a instalação do service worker (senão o navegador não oferece "instalar")
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// responde do cache e atualiza em segundo plano; só arquivos do próprio site
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
      .catch(()=>hit||caches.match('index.html')||Response.error());
    return hit||net;
  }));
});
