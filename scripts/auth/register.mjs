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
    const json = await response.json();

    console.log('Register response:', json);

    if (!response.ok) {
      const message =
        json?.errors?.[0]?.message ||
        json?.message ||
        'Could not register user';

      console.error('Register error:', message);
      alert(message);
      return;
    }

    alert('Registration successful! You can now log in.');
    window.location.href = '../login.html';

  } catch (error) {
    console.error('Register exception', error);
    alert('An error occurred during registration. Please try again later.');
  }
}

function onRegisterFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const formFields = Object.fromEntries(formData);
  console.log('Register form submitted:', formFields);
  registerUser(formFields);
}

if (registerForm) {
  registerForm.addEventListener('submit', onRegisterFormSubmit);
} else {
  console.error('Register form not found in DOM');
}