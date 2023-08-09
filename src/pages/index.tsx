import React from 'react';
import { useUserProvider } from '../Providers/UserProvider';

const App = () => {
  const { authenticated, user } = useUserProvider();

  return (
    <div>
      home page
      <br />
      {authenticated && user && user.id}
    </div>
  );
}

export default App;
