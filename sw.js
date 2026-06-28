/* StudyTrack — Service Worker (safe minimal version) */

const CACHE = "studytrack-v2";

/* Install — skip waiting immediately */
self.addEventListener("install", function(e){
  self.skipWaiting();
});

/* Activate — clear ALL old caches and take control */
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Fetch — network first, no caching for now */
self.addEventListener("fetch", function(e){
  /* Let Supabase and everything else go straight to network */
  e.respondWith(fetch(e.request).catch(function(){
    return caches.match(e.request);
  }));
});
