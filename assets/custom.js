/*
 * Broadcast Theme
 *
 * Use this file to add custom Javascript to Broadcast.  Keeping your custom
 * Javascript in this fill will make it easier to update Broadcast. In order
 * to use this file you will need to open layout/theme.liquid and uncomment
 * the custom.js script import line near the bottom of the file.
 */

(function () {
  // Add custom code below this line

  document.addEventListener("DOMContentLoaded", function () {
    // Find all add to cart forms
    const addToCartForms = document.querySelectorAll(".mg-custom-atc form");

    addToCartForms.forEach((form) => {
      // Check if quantity input exists, if not, add it
      if (!form.querySelector('input[name="quantity"]')) {
        const quantityInput = document.createElement("input");
        quantityInput.setAttribute("type", "hidden");
        quantityInput.setAttribute("name", "quantity");
        quantityInput.setAttribute("value", "1");
        form.appendChild(quantityInput);
      }

      if (form.action.indexOf("/cart/add") === -1) {
        form.action = "/cart/add";
      }
    });
  });

  function customScrollSlide() {
    const customBtnPrev = document.querySelector(
      "[data-custom-slider-arrow-prev]"
    );
    const customBtnNext = document.querySelector(
      "[data-custom-slider-arrow-next]"
    );
    const productMediaList = document.querySelector(
      "[data-product-media-list]"
    );

    const scrollAmount = () => {
      const slide = productMediaList[0];
      return slide
        ? slide.offsetWidth + parseInt(getComputedStyle(slide).marginRight)
        : 300;
    };

    if (customBtnNext) {
      customBtnNext.addEventListener("click", () => {
        productMediaList.scrollBy({
          left: scrollAmount(),
          behavior: "smooth",
        });
      });
    }
    if (customBtnPrev) {
      customBtnPrev.addEventListener("click", () => {
        productMediaList.scrollBy({
          left: -scrollAmount(),
          behavior: "smooth",
        });
      });
    }
  }

  customScrollSlide();

  // ^^ Keep your scripts inside this IIFE function call to
  // avoid leaking your variables into the global scope.
})();
