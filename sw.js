/* StudyTrack service worker — only job: make the timer notification work on
   phones and give it Pause / Stop buttons. It caches nothing and never touches
   your data. Keep this file in the same folder as index.html. */
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener("notificationclick", function(event){
  const action = event.action || "open";
  event.notification.close();
  event.waitUntil((async function(){
    const wins = await self.clients.matchAll({ type:"window", includeUncontrolled:true });
    if(wins.length){
      const c = wins.find(function(w){ return w.visibilityState === "visible"; }) || wins[0];
      c.postMessage({ type:"timer-action", action:action });
      if(action === "open"){ try{ await c.focus(); }catch(e){} }
    } else if(action === "open"){
      await self.clients.openWindow((event.notification.data && event.notification.data.url) || "./");
    }
  })());
});
