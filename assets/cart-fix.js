// More aggressive cart fix
(function() {
  function addQuantityToForms() {
    console.log('Cart fix script running');
    // Target all add to cart forms
    const allForms = document.querySelectorAll('form[action*="/cart/add"]');
    
    allForms.forEach(form => {
      // Check if quantity input exists
      if (!form.querySelector('input[name="quantity"]')) {
        console.log('Adding quantity input to form', form);
        const quantityInput = document.createElement('input');
        quantityInput.setAttribute('type', 'hidden');
        quantityInput.setAttribute('name', 'quantity');
        quantityInput.setAttribute('value', '1');
        form.appendChild(quantityInput);
      }
    });
  }
  
  // Run immediately and again when DOM is loaded
  addQuantityToForms();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addQuantityToForms);
  }
  
  // Also run after a delay to ensure all elements are loaded
  setTimeout(addQuantityToForms, 1000);
  setTimeout(addQuantityToForms, 2000);
})();