import React from 'react';

const UserContext = React.createContext({
  user: { isSignedIn: false },
});

export default UserContext;
