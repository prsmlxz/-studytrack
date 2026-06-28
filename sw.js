/* ============================================================
   StudyTrack — Service Worker
   Strategy: Cache-first for the app shell, network-first for
   Supabase API calls so data stays live.
   ============================================================ */

const CACHE = "studytrack-v1";

/* Files to cache on install — the entire app shell */
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json"
];

/* ── Install: pre-cache the app shell ── */
self.addEventListener("install", function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(PRECACHE);
    })
  );
});

/* ── Activate: delete old caches ── */
self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

/* ── Fetch: serve app shell from cache, pass Supabase through ── */
self.addEventListener("fetch", function(event){
  const url = new URL(event.request.url);

  /* Always go to network for Supabase API requests */
  if(url.hostname.includes("supabase.co")){
    event.respondWith(fetch(event.request));
    return;
  }

  /* Cache-first for everything else (the app shell) */
  event.respondWith(
    caches.match(event.request).then(function(cached){
      if(cached) return cached;
      return fetch(event.request).then(function(response){
        /* Cache successful GET responses for the app shell */
        if(event.request.method === "GET" && response.status === 200){
          var clone = response.clone();
          caches.open(CACHE).then(function(cache){ cache.put(event.request, clone); });
        }
        return response;
      });
    }).catch(function(){
      /* Offline fallback: serve the cached index */
      return caches.match("/index.html");
    })
  );
});
