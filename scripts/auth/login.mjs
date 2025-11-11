import {AUTH_LOGIN_URL} from '../api/api.mjs';
import { addToLocalStorage } from '../utilities/utilities.mjs';

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
    console.log(json.accessToken);
    const accessToken = json.data.accessToken;
    addToLocalStorage('accessToken', accessToken);

    console.log(json);
  } catch (error) {
    console.log(error);
  }
}

function onLoginFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);
  loginUser(formFields)
  console.log(formFields)
}

loginForm.addEventListener('submit', onLoginFormSubmit);