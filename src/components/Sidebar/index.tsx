import React, { FC } from 'react';
import { useNotificationProvider } from '../../Providers/NotificationProvider';

const Sidebar: FC = () => {
  const { count } = useNotificationProvider();

  return (
    <div>
      Sidebar
      <br />
      <br />
      <br />
      <b>{count}</b> notifs
    </div>
  );
};

export default Sidebar;
