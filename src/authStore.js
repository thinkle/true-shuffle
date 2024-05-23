// src/authStore.js
import { writable, derived, readable, get } from "svelte/store";

// Internal state variables
let authToken = localStorage.getItem("spotify_auth_token");
let refreshToken = localStorage.getItem("spotify_refresh_token");
let tokenExpiry = localStorage.getItem("spotify_token_expiry");
const _userInfo = writable(null);

// Derived store for logged-in state
const isLoggedIn = derived(_userInfo, ($userInfo) => !!authToken);

// Readable store for user info
const userInfo = readable(null, (set) => {
  _userInfo.subscribe((value) => set(value));
});

// Method to set auth token and expiry
const setAuthToken = (token, expiresIn) => {
  localStorage.setItem("spotify_auth_token", token);
  localStorage.setItem("spotify_token_expiry", Date.now() + expiresIn * 1000);
  authToken = token;
  tokenExpiry = Date.now() + expiresIn * 1000;
};

// Method to set refresh token
const setRefreshToken = (token) => {
  localStorage.setItem("spotify_refresh_token", token);
  refreshToken = token;
};

// Method to log out
const logout = () => {
  localStorage.removeItem("spotify_auth_token");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_token_expiry");
  authToken = null;
  refreshToken = null;
  tokenExpiry = null;
  _userInfo.set(null);
};

// Method to refresh auth token
const refreshAuthToken = async () => {
  if (refreshToken) {
    const response = await fetch("/.netlify/functions/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await response.json();
    setAuthToken(data.access_token, data.expires_in);
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
    }
  } else {
    logout();
  }
};

// Method to get auth token, refreshing if necessary
const getAuthToken = async () => {
  if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
    return authToken;
  }
  await refreshAuthToken();
  return authToken;
};

const updateUserInfo = async (token) => {
  // Fetch user info
  const userResponse = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const userData = await userResponse.json();
  _userInfo.set(userData);
};

// Method to handle login
const doLogin = async (code) => {
  const response = await fetch("/.netlify/functions/exchange", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  const data = await response.json();
  setAuthToken(data.access_token, data.expires_in);
  setRefreshToken(data.refresh_token);
  await updateUserInfo(data.access_token);
};

if (authToken && !get(userInfo)) {
  getAuthToken().then((token) => updateUserInfo(token));
}

export { isLoggedIn, userInfo, getAuthToken, doLogin, logout };
