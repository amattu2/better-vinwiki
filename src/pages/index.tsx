import React, { useState } from 'react';
import { useUserProvider } from '../Providers/UserProvider';
import { useNotificationProvider } from '../Providers/NotificationProvider';
import { FeedProvider } from '../Providers/FeedProvider';
import Feed from '../components/Feed';

const App = () => {
  const { authenticated, user } = useUserProvider();
  const { count } = useNotificationProvider();
  const [filteredFeed, setFilteredFeed] = useState<boolean>(false);

  return (
    <div>
      home page
      <br />
      {authenticated && user && user.id}
      <br />
      Notification count: {count}
      <br />
      <button onClick={() => setFilteredFeed(!filteredFeed)}>Toggle Filtered Feed</button>
      <FeedProvider filtered={filteredFeed}>
        <Feed />
      </FeedProvider>
    </div>
  );
}

export default App;
