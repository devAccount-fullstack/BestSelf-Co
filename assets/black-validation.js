document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;

  // ----------- Code Page Logic -----------
  if (currentPath === '/pages/password-gate') {
    const form = document.querySelector('#black-friday-validation .vip-form');
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
      e.preventDefault();
      const code = input.value.trim();

      if (code === "BLACKFRIDAY") {
        localStorage.setItem('vipAccessGranted', 'true');
        window.location.href = "/pages/black-friday-vip";
      } else {
        errorMessage.textContent = "Invalid Promo code";
        input.value = '';
        input.focus();
      }
    });
  }

  // ----------- VIP Page Protection Logic -----------
  if (currentPath === '/pages/black-friday-vip') {
    if (localStorage.getItem('vipAccessGranted') !== 'true') {
      window.location.href = "/pages/password-gate";
    }
  }
});
