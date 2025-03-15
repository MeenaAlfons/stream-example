"use client"

// Generate a random string for user ID
const generateUserId = () => {
  return 'user-' + (Math.random()).toString(36).substring(2, 15);
};

// Generate a random name
const generateUserName = () => {
  return 'User ' + Math.floor(Math.random() * 1000);
};

interface User {
  id: string;
  name: string;
  image: string;
}

const createNewUser = (): User => ({
  id: generateUserId(),
  name: generateUserName(),
  image: `https://getstream.io/random_svg/?name=User&id=${Date.now()}`,
});

export const getCurrentUser = (): User => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return createNewUser();
  }

  try {
    // Try to get user from session storage
    // const storedUser = sessionStorage.getItem('streamUser');
    
    // if (storedUser) {
    //   return JSON.parse(storedUser);
    // }

    // Create new user if none exists
    const newUser = createNewUser();

    // Store in session storage
    sessionStorage.setItem('streamUser', JSON.stringify(newUser));
    
    return newUser;
  } catch (error) {
    // Return a new user if sessionStorage is not available or throws an error
    console.warn('Session storage is not available:', error);
    return createNewUser();
  }
}; 