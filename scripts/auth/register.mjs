import {AUTH_REGISTER_URL} from '../api/api.mjs';

const registerForm = document.querySelector('#register-form');

async function registerUser(userDetails) {
  try {
    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(userDetails),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(AUTH_REGISTER_URL, fetchOptions);
  } catch (error) {
    console.log(error);
  }
}

function onRegisterFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);
  registerUser(formFields)
  console.log(formFields)
}

registerForm.addEventListener('submit', onRegisterFormSubmit);