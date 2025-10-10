/**
 * Listicle JSON Parser
 * Parses and renders list items from JSON stored in metaobjects
 */

document.addEventListener('DOMContentLoaded', function() {
  const listicleContainer = document.querySelector('.listicle-container');
  
  if (!listicleContainer) return;
  
  // Get the JSON data from the debug element (we'll update this)
  const debugElement = document.querySelector('.debug-info pre');
  
  if (debugElement) {
    try {
      const jsonString = debugElement.textContent.trim();
      const listItems = JSON.parse(jsonString);
      
      // Create the list HTML
      let listHTML = '<ol class="listicle-items">';
      
      listItems.forEach((item, index) => {
        listHTML += `
          <li class="listicle-item" data-item-number="${item.number || index + 1}">
            <div class="item-number-wrapper">
              <span class="item-number">${item.number || index + 1}</span>
            </div>
            
            <div class="item-content">
              <h2 class="item-headline">${item.headline}</h2>
              
              <div class="item-description">
                ${item.description}
              </div>
              
              ${item.supporting_data ? `
                <div class="supporting-data">
                  <svg class="data-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z"/>
                  </svg>
                  <span>${item.supporting_data}</span>
                </div>
              ` : ''}
            </div>
          </li>
        `;
      });
      
      listHTML += '</ol>';
      
      // Replace the debug info with the formatted list
      const listContainer = document.querySelector('.listicle-items');
      if (listContainer) {
        listContainer.innerHTML = listHTML;
      }
      
    } catch (error) {
      console.error('Error parsing listicle JSON:', error);
    }
  }
});