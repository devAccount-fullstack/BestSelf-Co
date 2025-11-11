document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;

  // ----------- Password / Code Page Logic -----------
  if (currentPath === '/pages/password-gate') {
    const form = document.querySelector('.vip-form');
    if (!form) return;

    const input = form.querySelector('input');
    const button = form.querySelector('button');

    // Update placeholder and button text to "Enter code"
    input.placeholder = "Enter code";
    button.textContent = "Submit";

    // Create error message element below the button if not exists
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
      e.preventDefault(); // prevent refresh
      const code = input.value.trim();

      if (code === "BLACKFRIDAY") {
        localStorage.setItem('vipAccessGranted', 'true');
        window.location.href = "/pages/black-friday-vip";
      } else {
        errorMessage.textContent = "Invalid Code";
        input.value = '';
        input.focus();
      }
    });
  }

  // ----------- VIP Page Protection Logic -----------
  if (currentPath === '/pages/black-friday-vip') {
    if (localStorage.getItem('vipAccessGranted') !== 'true') {
      // Redirect to the password page
      window.location.href = "/pages/password-gate";
    }
  }
});
