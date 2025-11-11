document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname.replace(/\/$/, ''); // normalize path

  // ----------- VIP Page Protection Logic -----------
  if (currentPath === '/pages/black-friday-vip') {
    if (localStorage.getItem('vipAccessGranted') !== 'true') {
      // Redirect to password page if access not granted
      window.location.href = "/pages/password-gate";
      return;
    }
  }

  // ----------- Password / Code Page Logic -----------
  if (currentPath === '/pages/password-gate') {
    const form = document.querySelector('.vip-form');
    if (!form) return;

    const input = form.querySelector('input');
    const button = form.querySelector('button');

    // Update placeholder and button text
    input.placeholder = "Enter code";
    button.textContent = "Submit";

    // Add error message element below button if it doesn't exist
    let errorMessage = form.querySelector('.vip-error-message');
    if (!errorMessage) {
      errorMessage = document.createElement('p');
      errorMessage.className = 'vip-error-message';
      errorMessage.style.color = 'red';
      errorMessage.style.marginTop = '10px';
      errorMessage.style.fontWeight = '500';
      form.appendChild(errorMessage);
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault(); // prevent page reload
      const code = input.value.trim();

      if (code === "BLACKFRIDAY") {
        // Code correct → store access and redirect to VIP page
        localStorage.setItem('vipAccessGranted', 'true');
        window.location.href = "/pages/black-friday-vip";
      } else {
        // Code incorrect → show error message
        errorMessage.textContent = "Incorrect Code";
        input.value = '';
        input.focus();
      }
    });
  }
});
