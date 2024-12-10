// src/utils/tokenManager.js

let accessToken = null;

if (typeof window !== "undefined") {
  accessToken = localStorage.getItem("accessToken"); // Check localStorage only in the browser
}

export const setAccessToken = (token) => {
  accessToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token); // Persist to localStorage
  }
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken"); // Clear from localStorage
  }
};