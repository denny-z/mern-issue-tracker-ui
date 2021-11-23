import React from 'react';

const UserContext = React.createContext({
  user: { signedIn: false },
});

export default UserContext;
