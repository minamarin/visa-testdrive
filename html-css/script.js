(function () {
  // ------- Element refs -------
  const form = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const errorSummary = document.getElementById('error-summary');
  const status = document.getElementById('status');
  const togglePw = document.getElementById('toggle-password');

  if (!form) {
    // If the script loads on a page without the form, just exit gracefully.
    return;
  }

  // ------- Helpers -------
  const EMAIL_RE = /.+@.+\..+/; // simple check; rely on type="email" too

  function setFieldError(field, container, message) {
    container.textContent = message;
    container.hidden = false;
    field.setAttribute('aria-invalid', 'true');
  }

  function clearFieldError(field, container) {
    container.textContent = '';
    container.hidden = true;
    field.removeAttribute('aria-invalid');
  }

  function validateEmail() {
    clearFieldError(email, emailError);
    const val = email.value.trim();
    if (!val) {
      setFieldError(email, emailError, 'Please enter your email address.');
      return false;
    }
    if (!EMAIL_RE.test(val)) {
      setFieldError(email, emailError, 'Enter a valid email like name@example.com.');
      return false;
    }
    return true;
  }

  function validatePassword() {
    clearFieldError(password, passwordError);
    const val = password.value;
    if (!val) {
      setFieldError(password, passwordError, 'Please enter your password.');
      return false;
    }
    if (val.length < 8) {
      setFieldError(password, passwordError, 'Password must be at least 8 characters.');
      return false;
    }
    return true;
  }

  function buildErrorSummary(messages) {
    const listItems = messages.map(m => `<li>${m}</li>`).join('');
    errorSummary.innerHTML = `<h3>There’s a problem</h3><ul>${listItems}</ul>`;
    errorSummary.hidden = false;
    // Move focus so screen readers announce the alert content
    errorSummary.focus();
  }

  function clearErrorSummary() {
    errorSummary.hidden = true;
    errorSummary.innerHTML = '';
  }

  function announce(msg) {
    status.textContent = msg; // aria-live="polite"
  }

  // ------- Events -------
  // Real-time validation on blur
  email.addEventListener('blur', validateEmail);
  password.addEventListener('blur', validatePassword);

  // Toggle password visibility
  if (togglePw) {
    togglePw.addEventListener('click', () => {
      const showing = password.type === 'text';
      password.type = showing ? 'password' : 'text';
      togglePw.setAttribute('aria-pressed', String(!showing));
      togglePw.textContent = showing ? 'Show' : 'Hide';
      password.focus(); // Keep focus where user was
    });
  }

  // Submit handler (custom validation since form has novalidate)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrorSummary();
    announce(''); // clear previous live message

    const okEmail = validateEmail();
    const okPassword = validatePassword();

    if (!okEmail || !okPassword) {
      const messages = [];
      if (!okEmail) messages.push('Email: ' + emailError.textContent);
      if (!okPassword) messages.push('Password: ' + passwordError.textContent);
      buildErrorSummary(messages);

      // Move focus to first invalid control after the summary is announced
      const firstInvalid = !okEmail ? email : password;
      setTimeout(() => firstInvalid.focus(), 120);
      return;
    }

    // Simulate successful sign-in
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    announce('Signed in successfully. Redirecting…');

    // Fake redirect; reset after short delay
    setTimeout(() => {
      form.reset();
      if (submitBtn) submitBtn.disabled = false;
      announce('You are signed out (demo).');
      email.focus();
    }, 1200);
  });
})();