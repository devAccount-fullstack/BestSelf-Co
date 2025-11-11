document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname.replace(/\/$/, '');

  // ----------- VIP Page Protection Logic -----------
  if (currentPath === '/pages/black-friday-vip') {
    if (localStorage.getItem('vipAccessGranted') !== 'true') {
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
    const errorMessage = document.getElementById('vip-error-message');

    input.placeholder = "Enter code";
    button.textContent = "Submit";

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const code = input.value.trim();

      if (code === "BLACKFRIDAY") {
        localStorage.setItem('vipAccessGranted', 'true');
        window.location.href = "/pages/black-friday-vip";
      } else {
        // Show the error message
        errorMessage.textContent = "Incorrect Code";
        errorMessage.style.display = "block";
        input.value = '';
        input.focus();
      }
    });
  }
});
