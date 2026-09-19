self.addEventListener(
  'notificationclick',
  (event) => {
    event.notification.close();

    const data =
      event.notification?.data || {};

    const targetUrl =
      data.url || '/chat';

    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then((clientList) => {
          for (
            const client of clientList
          ) {
            if (
              'focus' in client
            ) {
              if (
                'navigate' in client
              ) {
                client.navigate(
                  targetUrl
                );
              }

              return client.focus();
            }
          }

          if (
            clients.openWindow
          ) {
            return clients.openWindow(
              targetUrl
            );
          }

          return undefined;
        })
    );
  }
);