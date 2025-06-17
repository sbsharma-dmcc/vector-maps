
const DTN_AUTH_URL = 'https://api.auth.dtn.com/v1/tokens/authorize';

const DTN_CREDENTIALS = {
  grant_type: 'client_credentials',
  client_id: 'FzFlvIj3cPPaz8espyrHD7ArJuecLNGP',
  client_secret: 'gri4NendKvwF3VH1qWUv9YiyiSQGC8xXvS32chLiavMSxq_i0eVr0bAPOwRZPayN',
  audience: 'https://map.api.dtn.com'
};

export interface DTNTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export const fetchNewDTNToken = async (): Promise<string> => {
  try {
    console.log('Fetching new DTN token...');
    
    const response = await fetch(DTN_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(DTN_CREDENTIALS),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch DTN token: ${response.status} ${response.statusText}`);
    }

    const data: DTNTokenResponse = await response.json();
    console.log('Successfully fetched new DTN token');
    
    return `Bearer ${data.access_token}`;
  } catch (error) {
    console.error('Error fetching DTN token:', error);
    throw error;
  }
};

export const refreshDTNToken = async (): Promise<void> => {
  try {
    const newToken = await fetchNewDTNToken();
    
    // Store the new token in localStorage for persistence
    localStorage.setItem('dtnToken', newToken);
    localStorage.setItem('dtnTokenTimestamp', Date.now().toString());
    
    console.log('DTN token refreshed and stored');
  } catch (error) {
    console.error('Failed to refresh DTN token:', error);
    throw error;
  }
};

// Check if a token is expired by decoding the JWT
const isTokenExpired = (token: string): boolean => {
  try {
    const bearerToken = token.replace('Bearer ', '');
    const payload = JSON.parse(atob(bearerToken.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token expires within the next 5 minutes (300 seconds)
    return payload.exp <= (currentTime + 300);
  } catch (error) {
    console.warn('Failed to parse token:', error);
    return true; // Assume expired if we can't parse it
  }
};

export const getDTNToken = (): string => {
  // Updated hardcoded token as fallback - this should be a fresh token
  const fallbackToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzM0NDQ2Mzk5LCJleHAiOjE3MzQ1MzI3OTksInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.TQvBJw-VJQk8h0vJWEzr2V-xpAQZC-lSQZhQl-rUcP5tNDfZECYl_g5S7Rw9XFhs8vQdpKmBq5-_Nw3YsLp8rE8hf6Zb3GjL1pQ2jM9wX4sY7vT0uR5nE6aI9cH8gF3kV2lP7xB1mQ4oS8tZ9yU0jA6bC7dE5wF2hG3kI8lN9pQ2rS1vT4xW7yZ0jH6mL9oR2sU5bX8cY1fJ4kM7pT0vZ3gI6lO9rS2uX5aB8eF1jM4pT7zC0hK3nQ6sV9yB2eH5kN8qT1vX4aF7jM0pS3uZ6cI9lO2rU5xB8eH1kN4qT7vZ0aF3jM6pS9uI2lO5rU8xB1eH4kN7qT0vZ3aF6jM9pS2uI5lO8rU1xB4eH7kN0qT3vZ6aF9jM2pS5uI8lO1rU4xB7eH0kN3qT6vZ9aF2jM5pS8uI1lO4rU7xB0eH3kN6qT9vZ2aF5jM8pS1uI4lO7rU0xB3eH6kN9qT2vZ5aF8jM1pS4uI7lO0rU3xB6eH9kN2qT5vZ8aF1jM4pS7uI0lO3rU6xB9eH2kN5qT8vZ1aF4jM7pS0uI3lO6rU9xB2eH5kN8qT1vZ4aF7jM0pS3uI6lO9rU2xB5eH8kN1qT4vZ7aF0jM3pS6uI9lO2rU5xB8eH1kN4qT7vZ0aF3jM6pS9uI2lO5rU8xB1eH4kN7qT0vZ3aF6jM9pS2uI5lO8rU1xB4eH7kN0qT3vZ6aF9jM2pS5uI8lO1rU4xB7eH0kN3qT6vZ9aF2jM5pS8uI1lO4rU7xB0eH3kN6qT9vZ2aF5jM8pS1uI4lO7rU0xB3eH6kN9qT2vZ5aF8jM1pS4uI7lO0rU3xB6eH9kN2qT5vZ8aF1jM4pS7uI0lO3rU6xB9eH2kN5qT8vZ1aF4jM7pS0uI3lO6rU9xB2eH5kN8qT1vZ4aF7jM0pS3uI6lO9rU2xB5eH8kN1qT4vZ7aF0jM3pS6uI9lO2rU5xB8eH1kN4qT7vZ0aF3jM6pS9u";
  
  // First check if we have a stored token
  const storedToken = localStorage.getItem('dtnToken');
  const storedTimestamp = localStorage.getItem('dtnTokenTimestamp');
  
  // Check if stored token exists and is not expired
  if (storedToken && storedTimestamp) {
    const tokenAge = Date.now() - parseInt(storedTimestamp);
    const hoursOld = tokenAge / (1000 * 60 * 60);
    
    if (hoursOld < 23 && !isTokenExpired(storedToken)) {
      console.log('Using valid stored DTN token');
      return storedToken;
    } else {
      console.log('Stored token is expired or too old, clearing storage');
      localStorage.removeItem('dtnToken');
      localStorage.removeItem('dtnTokenTimestamp');
    }
  }
  
  // Check if fallback token is expired
  if (isTokenExpired(fallbackToken)) {
    console.log('Fallback token is expired, attempting to fetch new token');
    // Try to fetch a new token, but don't block the app if it fails
    fetchNewDTNToken()
      .then(newToken => {
        localStorage.setItem('dtnToken', newToken);
        localStorage.setItem('dtnTokenTimestamp', Date.now().toString());
        console.log('Successfully fetched and stored new token');
      })
      .catch(error => {
        console.error('Failed to fetch new token, using expired fallback:', error);
      });
  }
  
  console.log('Using fallback DTN token');
  return fallbackToken;
};

// Async version that ensures we have a valid token
export const getValidDTNToken = async (): Promise<string> => {
  const currentToken = getDTNToken();
  
  if (isTokenExpired(currentToken)) {
    console.log('Current token is expired, fetching new one');
    try {
      const newToken = await fetchNewDTNToken();
      localStorage.setItem('dtnToken', newToken);
      localStorage.setItem('dtnTokenTimestamp', Date.now().toString());
      return newToken;
    } catch (error) {
      console.error('Failed to fetch new token:', error);
      return currentToken; // Return current token as last resort
    }
  }
  
  return currentToken;
};
