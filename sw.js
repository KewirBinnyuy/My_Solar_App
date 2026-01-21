// Service Worker for Solar System Sizer PWA

const CACHE_NAME = 'solar-sizer-v1.0';
const ASSETS_TO_CACHE = [
  '/solar-system-sizer/',  // Add this
  '/solar-system-sizer/index.html',
  '/solar-system-sizer/style.css',
  '/solar-system-sizer/app.js',
  '/solar-system-sizer/sw.js',
  '/solar-system-sizer/manifest.json',
  '/solar-system-sizer/icons/icon-192.png'
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the new resource
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.url.includes('.html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-projects') {
    event.waitUntil(syncProjects());
  }
});

// Function to sync projects when back online
function syncProjects() {
  // This would sync with a backend server if implemented
  console.log('Syncing projects with server...');
  return Promise.resolve();
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Solar Sizer notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Solar System Sizer', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
