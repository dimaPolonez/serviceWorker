// firebase-messaging-sw.js

// Загружаем скрипт Firebase
self.importScripts('https://www.gstatic.com/firebasejs/3.6.8/firebase-app.js');
self.importScripts('https://www.gstatic.com/firebasejs/3.6.8/firebase-messaging.js');

// Инициализируем Firebase с идентификатором отправителя
firebase.initializeApp({
    messagingSenderId: '1035565280105'
});

// Получаем объект messaging
const messaging = firebase.messaging();
