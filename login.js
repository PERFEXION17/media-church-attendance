const loginBtn = document.getElementById("login-submit");
const emailField = document.getElementById("login-email");
const passwordField = document.getElementById("login-password");
const errorDisplay = document.getElementById("auth-error");

loginBtn.addEventListener("click", async () => {
  const email = emailField.value.trim();
  const password = passwordField.value;

  if (!email || !password) {
    errorDisplay.innerText = "Please fill in all fields.";
    return;
  }

  try {
    // Attempt to sign in
    await firebase.auth().signInWithEmailAndPassword(email, password);

    // If successful, the browser will move to the index
    window.location.href = "index.html";
  } catch (error) {
    // Map common Firebase errors to user-friendly messages
    switch (error.code) {
      case "auth/user-not-found":
        errorDisplay.innerText = "No account found with this email.";
        break;
      case "auth/wrong-password":
        errorDisplay.innerText = "Incorrect password.";
        break;
      default:
        errorDisplay.innerText = "Login failed. Please try again.";
    }
  }
});
