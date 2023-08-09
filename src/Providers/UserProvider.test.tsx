import React from 'react';
import { screen, render } from '@testing-library/react';
import { UserProvider, useUserProvider } from './UserProvider';

const TestChild = () => {
  const { status } = useUserProvider();

  return (
    <div>
      {status}
    </div>
  );
};

const TestParent = () => {
  return (
    <UserProvider token="empty">
      <TestChild />
    </UserProvider>
  );
};

describe('UserProvider General Tests', () => {
  it("throws an exception when used outside of UserProvider", () => {
    expect(() => {
      render(<TestChild />);
    }).toThrow("useUserProvider must be used within a UserProvider");
  });

  it("renders the initial state", () => {
    render(<TestParent />);

    expect(screen.getByText("LOADING")).toBeInTheDocument();
  });
});
