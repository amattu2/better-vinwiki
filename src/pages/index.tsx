import React from 'react';
import { useUserProvider } from '../Providers/UserProvider';
import { useNotificationProvider } from '../Providers/NotificationProvider';

const App = () => {
  const { authenticated, user } = useUserProvider();
  const { count } = useNotificationProvider();

  return (
    <div>
      home page
      <br />
      {authenticated && user && user.id}
      <br />
      Notification count: {count}
    </div>
  );
}

export default App;
