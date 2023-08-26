import React from 'react';
import { useAuthProvider } from '../Providers/AuthProvider';
import { ProviderStatus, useNotificationProvider } from '../Providers/NotificationProvider';
import Feed from '../pages/feed/Controller';

const App = () => {
  const { authenticated, user } = useAuthProvider();
  const { status, count } = useNotificationProvider();

  return (
    <div>
      home page
      <br />
      {authenticated && user && user.id}
      <br />
      Notification count: {status === ProviderStatus.LOADED ? count : "Loading notifications..."}
      <br />
      <Feed />
    </div>
  );
}

export default App;
