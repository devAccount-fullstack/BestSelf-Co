document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;

  // ----------- Code Gate Page Logic -----------
  if (currentPath === '/pages/password-gate') {
    // Inject the code entry form dynamically (optional, or keep your HTML form in page)
    const container = document.querySelector('body'); // you can target a specific div if you want
    const formHtml = `
      <section id="black-vip-code" style="text-align:center; padding:60px 20px; font-family:'Poppins',sans-serif;">
        <h2>Enter Your VIP Code</h2>
        <form class="vip-form">
          <input type="text" placeholder="Enter code" style="padding:16px 24px; font-size:20px; border-radius:50px; border:1px solid #ccc; margin-right:10px; width:250px;" />
          <button type="submit" style="padding:16px 36px; border-radius:50px; background:#e6b85c; color:#404040; font-weight:600; cursor:pointer;">Submit</button>
        </form>
      </section>
    `;
    container.insertAdjacentHTML('afterbegin', formHtml);

    const form = document.querySelector('#black-vip-code .vip-form');
    const input = form.querySelector('input');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const code = input.value.trim();

      if (code === "BLACKFRIDAY") {
        localStorage.setItem('vipAccessGranted', 'true');
        window.location.href = "/pages/black-friday-vip";
      } else {
        alert("Incorrect code. Please try again.");
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
