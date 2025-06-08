// Quick View Functionality
document.addEventListener('DOMContentLoaded', () => {
  const quickViewButtons = document.querySelectorAll('.quick-view');
  const quickViewPanel = document.querySelector('.quick-view-panel');
  const closeButton = document.querySelector('.close-quick-view');
  
  // Show quick view panel
  quickViewButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const productCard = event.target.closest('.product-card');
      
      // Update panel content
      document.getElementById('quick-view-img').src = productCard.querySelector('img').src;
      document.getElementById('quick-view-img').alt = productCard.querySelector('h3').textContent;
      document.getElementById('quick-view-title').textContent = productCard.querySelector('h3').textContent;
      document.getElementById('quick-view-price').textContent = productCard.querySelector('.price').textContent;
      document.getElementById('quick-view-description').textContent = productCard.querySelector('.product-description').textContent;
      
      // Show the panel
      quickViewPanel.style.display = 'block';
      quickViewPanel.classList.add('active');
    });
  });
  
  // Close quick view panel
  closeButton.addEventListener('click', () => {
    quickViewPanel.style.display = 'none';
    quickViewPanel.classList.remove('active');
  });
  
  // Close panel when clicking outside
  document.addEventListener('click', (event) => {
    if (event.target === quickViewPanel) {
      quickViewPanel.style.display = 'none';
      quickViewPanel.classList.remove('active');
    }
  });
  
  // Quantity controls
  const minusBtn = document.querySelector('.quantity-btn.minus');
  const plusBtn = document.querySelector('.quantity-btn.plus');
  const quantityInput = document.querySelector('#quantity');
  
  minusBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });
  
  plusBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue < 10) {
      quantityInput.value = currentValue + 1;
    }
  });
}); 