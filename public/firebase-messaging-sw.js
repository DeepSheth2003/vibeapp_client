importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCPAK65qBuetXryTic3N9U9hOguvPGGzNA",
  authDomain: "vibe-7b587.firebaseapp.com",
  projectId: "vibe-7b587",
  messagingSenderId: "314769516875",
  appId: "1:314769516875:web:0d46708dabf594941c20ce"
});

const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function (payload) {
//   self.registration.showNotification(payload.notification.title, {
//     body: payload.notification.body,
//     icon: "/logo192.png",
//   });
// });

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // Aapke app ka logo path
    data: payload.data // chatId yahan aayegi
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});