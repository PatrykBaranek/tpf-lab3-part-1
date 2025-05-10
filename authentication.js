import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';


const firebaseConfig = {
  apiKey: 'AIzaSyBgsKmc3JM0P7aiNzZz1Dosn-i9Oh1sikk',
  authDomain: 'tpf-pk-1b131.firebaseapp.com',
  projectId: 'tpf-pk-1b131',
  storageBucket: 'tpf-pk-1b131.firebasestorage.app',
  messagingSenderId: '765239218666',
  appId: '1:765239218666:web:5715164256db40d6162293',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInButton = document.querySelector("#signInButton");
const signOutButton = document.querySelector("#signOutButton");

const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');

const userSignIn = async () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("User signed in:", user);
    })
    .catch((error) => {
      console.error("Sign in error:", error.code, error.message);
      alert("Error signing in: " + error.message);
    });
};

const userSignOut = async () => {
  signOut(auth)
    .then(() => {
      alert("You have been signed out!");
    })
    .catch((error) => {
      console.error("Sign out error:", error.code, error.message);
      alert("Error signing out: " + error.message);
    });
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    alert("You are authenticated with Google");
    console.log(user);

    if (emailInput && user.email) {
      emailInput.value = user.email;
    } else if (emailInput) {
      emailInput.value = '';
    }

    if (user.displayName) {
      const nameParts = user.displayName.split(' ');

      if (firstNameInput && nameParts.length > 0) {
        firstNameInput.value = nameParts[0];
      } else if (firstNameInput) {
        firstNameInput.value = '';
      }

      if (lastNameInput && nameParts.length > 1) {
        lastNameInput.value = nameParts.slice(1).join(' ');
      } else if (lastNameInput) {
        lastNameInput.value = '';
      }
    } else {
      if (firstNameInput) firstNameInput.value = '';
      if (lastNameInput) lastNameInput.value = '';
    }
  } else {
    if (firstNameInput) firstNameInput.value = '';
    if (lastNameInput) lastNameInput.value = '';
    if (emailInput) emailInput.value = '';
  }
});

if (signInButton) {
  signInButton.addEventListener("click", userSignIn);
}
if (signOutButton) {
  signOutButton.addEventListener("click", userSignOut);
}