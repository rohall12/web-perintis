importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDJE6Ua3tGM0ltnuBiXC5jvM-VLBZCmGqI",
  authDomain: "my-portofolio-c2eeb.firebaseapp.com",
  projectId: "my-portofolio-c2eeb",
  storageBucket: "my-portofolio-c2eeb.firebasestorage.app",
  messagingSenderId: "686049637486",
  appId: "1:686049637486:web:6362caafe9ed4fb37c227f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/new_hero_character.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});