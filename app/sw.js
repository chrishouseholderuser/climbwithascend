/* Ascend service worker — offline app shell caching. Bump CACHE to force an update. */
var CACHE = "ascend-v8";
var ASSETS = ["./", "./index.html", "./data.js", "./generators.js", "./manifest.webmanifest",
              "./privacy.html", "./terms.html", "./pledge.html",
              "./icon-192.png", "./icon-512.png", "./icon-maskable.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method!=="GET") return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(resp){
        if(resp && resp.status===200 && resp.type==="basic"){ var copy=resp.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); }); }
        return resp;
      }).catch(function(){ return caches.match("./index.html"); });
    })
  );
});
