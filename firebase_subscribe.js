document.addEventListener('DOMContentLoaded', function() {
    var subscribeButton = document.getElementById('subscribe');
    if (subscribeButton) {
        subscribeButton.addEventListener('click', function() {
            subscribe();
        });
    }
});

firebase.initializeApp({
    messagingSenderId: '523978386548'
});

// браузер поддерживает уведомления
// вообще, эту проверку должна делать библиотека Firebase, но она этого не делает
if ('Notification' in window) {
    var messaging = firebase.messaging();

    // пользователь уже разрешил получение уведомлений
    // подписываем на уведомления если ещё не подписали
    if (Notification.permission === 'granted') {
        subscribe();
    }

    // по клику, запрашиваем у пользователя разрешение на уведомления
    // и подписываем его
    document.getElementById('subscribe').addEventListener('click', function() {
        subscribe();
    });
}

function subscribe() {
    // запрашиваем разрешение на получение уведомлений
    messaging.requestPermission()
        .then(function() {
            // получаем ID устройства
            messaging.getToken()
                .then(function(currentToken) {
                    console.log(currentToken);

                    if (currentToken) {
                        sendTokenToServer(currentToken);
                    } else {
                        console.warn('Не удалось получить токен.');
                        setTokenSentToServer(false);
                    }
                })
                .catch(function(err) {
                    console.warn('При получении токена произошла ошибка.', err);
                    setTokenSentToServer(false);
                });
        })
        .catch(function(err) {
            console.warn('Не удалось получить разрешение на показ уведомлений.', err);
        });
}

// отправка ID на сервер
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer(currentToken)) {
        console.log('Отправка токена на сервер...');

        var url = ''; // адрес скрипта на сервере который сохраняет ID устройства
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ token: currentToken }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function() {
            setTokenSentToServer(currentToken);
        })
        .catch(function(error) {
            console.error('Ошибка при отправке токена на сервер:', error);
        });
    } else {
        console.log('Токен уже отправлен на сервер.');
    }
}

function unsubscribeAndClearLocalStorage() {
    // Получаем ID устройства из Local Storage
    var currentToken = localStorage.getItem('sentFirebaseMessagingToken');

    // Очищаем Local Storage
    localStorage.removeItem('sentFirebaseMessagingToken');

    // Удаляем устройство из Firestore
    if (currentToken) {
        var url = ''; // Адрес скрипта на сервере для удаления устройства из Firestore
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ token: currentToken }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            if (response.ok) {
                console.log('Устройство удалено из Firestore.');
            } else {
                console.error('Ошибка при удалении устройства из Firestore:', response.statusText);
            }
        })
        .catch(function(error) {
            console.error('Ошибка при отправке запроса на удаление устройства из Firestore:', error);
        });
    } else {
        console.warn('Не найден токен устройства в Local Storage.');
    }
}

// Добавляем обработчик события на клик по кнопке "Отписаться и очистить Local Storage"
document.getElementById('unsubscribeAndClearLocalStorage').addEventListener('click', function() {
    unsubscribeAndClearLocalStorage();
});

// используем localStorage для отметки того,
// что пользователь уже подписался на уведомления
function isTokenSentToServer(currentToken) {
    return window.localStorage.getItem('sentFirebaseMessagingToken') == currentToken;
}

function setTokenSentToServer(currentToken) {
    window.localStorage.setItem(
        'sentFirebaseMessagingToken',
        currentToken ? currentToken : ''
    );
}
