document.addEventListener('DOMContentLoaded', function() {
    var subscribeButton = document.getElementById('subscribe');
    var unsubscribeButton = document.getElementById('unsubscribe');
    if (subscribeButton) {
        subscribeButton.addEventListener('click', function() {
            subscribe();
        });
    }

    if (unsubscribeButton) {
        unsubscribeButton.addEventListener('click', function() {
            unsubscribe();
        });
    }
});

firebase.initializeApp({
    messagingSenderId: '1035565280105'
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

    // Добавляем обработчик события на клик по кнопке "Отписаться и очистить Local Storage"
document.getElementById('unsubscribe').addEventListener('click', function() {
    unsubscribe();
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
