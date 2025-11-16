import {AUTH_LOGIN_URL} from '../api/api.mjs';
import { addToLocalStorage } from '../utilities.mjs';

const loginForm = document.querySelector('#login-form');


async function loginUser(userDetails) {
  try {
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(userDetails),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(AUTH_LOGIN_URL, fetchOptions);
    const json = await response.json();

    console.log('Login response:', json);

    if (!response.ok) {
      const message =
        json?.errors?.[0]?.message ||
        json?.message ||
        'Login failed';

      console.error('Login error:', message);
      alert(message);
      return;
    }


    const { accessToken, name, email } = json?.data || {};

    if (!accessToken) {
      console.error('No access token in response:', json);
      alert('Login failed: No access token returned');
      return;
    }


    addToLocalStorage('accessToken', accessToken);

    if (name) {
      addToLocalStorage('userName', name);
    } else {
      console.warn('No "name" field in login response data');
    }

    if (email) {
      addToLocalStorage('userEmail', email);
    }

    window.location.href = 'posts/feed.html';

  } catch (error) {
    console.error('Login exception', error);
    alert('An error occurred during login. Please try again later.');
  }
}

function onLoginFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);

  console.log('Login form submitted:', formFields);
  loginUser(formFields)
}

loginForm.addEventListener('submit', onLoginFormSubmit);