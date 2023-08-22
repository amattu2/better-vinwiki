import React, { useState } from 'react';
import { useAuthProvider } from '../Providers/AuthProvider';
import { ProviderStatus, useNotificationProvider } from '../Providers/NotificationProvider';
import { FeedProvider } from '../Providers/FeedProvider';
import Feed from '../components/Feed';

const App = () => {
  const { authenticated, user } = useAuthProvider();
  const { status, count } = useNotificationProvider();
  const [filteredFeed, setFilteredFeed] = useState<boolean>(false);

  return (
    <div>
      home page
      <br />
      {authenticated && user && user.id}
      <br />
      Notification count: {status === ProviderStatus.LOADED ? count : "Loading notifications..."}
      <br />
      <button onClick={() => setFilteredFeed(!filteredFeed)}>Toggle Filtered Feed</button>
      <FeedProvider filtered={filteredFeed}>
        <Feed />
      </FeedProvider>
    </div>
  );
}

export default App;
