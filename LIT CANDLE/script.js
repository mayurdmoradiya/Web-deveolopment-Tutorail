// We'll use this file for features like cart functionality, product filtering, etc.
console.log("Welcome to LIT Candle website");

// Image loading animation
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });
});

// Cart functionality
class ShoppingCart {
  constructor() {
    this.items = [];
    this.loadCart();
    this.updateCartCount();
    this.renderCart();
    this.bindEvents();
  }

  bindEvents() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => this.addToCart(e));
    });

    // Cart page specific events
    if (document.querySelector('.cart-page')) {
      this.renderCart();
      document.getElementById('checkout-btn')?.addEventListener('click', () => this.checkout());
    }

    // Quick view buttons
    document.querySelectorAll('.quick-view').forEach(button => {
      button.addEventListener('click', (e) => this.showQuickView(e));
    });

    // Search functionality
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e));
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => this.filterProducts(e));
    }

    // Sort functionality
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => this.sortProducts(e));
    }
  }

  loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.items = JSON.parse(savedCart);
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }

  addToCart(event) {
    const button = event.currentTarget;
    const productCard = button.closest('.product-card');
    const product = {
      id: productCard.dataset.id || Math.random().toString(36).substr(2, 9),
      name: productCard.querySelector('h3').textContent,
      price: parseFloat(productCard.querySelector('.price').textContent.replace('$', '')),
      image: productCard.querySelector('img').src,
      quantity: 1
    };

    this.addToCart(product);
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
    this.renderCart();
    this.showNotification('Item removed from cart');
  }

  updateQuantity(productId, newQuantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      if (newQuantity > 0) {
        item.quantity = newQuantity;
  } else {
        this.removeItem(productId);
      }
      this.saveCart();
      this.updateCartCount();
      this.renderCart();
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  renderCart() {
    const cartItems = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartItems || !cartSummary) return;

    if (this.items.length === 0) {
      cartItems.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-cart"></i>
          <p>Your cart is empty</p>
          <a href="shop.html" class="btn">Continue Shopping</a>
        </div>
      `;
      cartSummary.innerHTML = '';
      return;
    }

    // Render cart items
    cartItems.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <p class="price">$${item.price.toFixed(2)}</p>
          <div class="quantity-controls">
            <button class="quantity-btn minus" aria-label="Decrease quantity">-</button>
            <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" aria-label="Item quantity">
            <button class="quantity-btn plus" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-item" aria-label="Remove item">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');

    // Calculate totals
    const subtotal = this.getTotal();
    const shipping = subtotal > 0 ? 5.99 : 0;
    const total = subtotal + shipping;

    // Render cart summary
    cartSummary.innerHTML = `
      <div class="summary-header">
        <h2>Order Summary</h2>
      </div>
      <div class="summary-details">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>$${shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>
      <button class="checkout-btn" ${this.items.length === 0 ? 'disabled' : ''}>
        Proceed to Checkout
      </button>
    `;

    this.attachCartEventListeners();
  }

  attachCartEventListeners() {
    // Quantity controls
    document.querySelectorAll('.cart-item-quantity').forEach(input => {
      input.addEventListener('change', (e) => {
        const productId = e.target.closest('.cart-item').dataset.id;
        const newQuantity = parseInt(e.target.value);
        this.updateQuantity(productId, newQuantity);
      });
    });

    // Plus/Minus buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const input = e.target.parentElement.querySelector('.cart-item-quantity');
        const productId = e.target.closest('.cart-item').dataset.id;
        const currentValue = parseInt(input.value);
        
        if (e.target.classList.contains('plus')) {
          input.value = currentValue + 1;
        } else if (e.target.classList.contains('minus')) {
          input.value = Math.max(1, currentValue - 1);
        }
        
        this.updateQuantity(productId, parseInt(input.value));
      });
    });

    // Remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.closest('.cart-item').dataset.id;
        this.removeItem(productId);
      });
    });
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showQuickView(event) {
    const productCard = event.target.closest('.product-card');
    const panel = document.querySelector('.quick-view-panel');
    
    // Update panel content
    document.getElementById('quick-view-img').src = productCard.querySelector('img').src;
    document.getElementById('quick-view-img').alt = productCard.querySelector('h3').textContent;
    document.getElementById('quick-view-title').textContent = productCard.querySelector('h3').textContent;
    document.getElementById('quick-view-price').textContent = productCard.querySelector('.price').textContent;
    document.getElementById('quick-view-description').textContent = productCard.querySelector('.product-description').textContent;
    
    // Show the panel
    panel.style.display = 'block';
    panel.classList.add('active');
    
    // Add event listener for close button
    const closeBtn = panel.querySelector('.close-quick-view');
    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
      panel.classList.remove('active');
    });
    
    // Add event listener for quantity controls
    const minusBtn = panel.querySelector('.quantity-btn.minus');
    const plusBtn = panel.querySelector('.quantity-btn.plus');
    const quantityInput = panel.querySelector('#quantity');
    
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
    
    // Add event listener for add to cart button
    const addToCartBtn = panel.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', () => {
      const product = {
        id: productCard.dataset.id || Math.random().toString(36).substr(2, 9),
        name: productCard.querySelector('h3').textContent,
        price: parseFloat(productCard.querySelector('.price').textContent.replace('$', '')),
        image: productCard.querySelector('img').src,
        quantity: parseInt(quantityInput.value)
      };
      
      this.addToCart(product);
      panel.style.display = 'none';
      panel.classList.remove('active');
    });
  }

  filterProducts(event) {
    const category = document.getElementById('category-filter').value;
    const priceRange = document.getElementById('price-range').value;
    const products = document.querySelectorAll('.product-card');

    products.forEach(product => {
      const productPrice = parseFloat(product.dataset.price);
      const productCategory = product.dataset.category;
      
      let categoryMatch = !category || productCategory === category;
      let priceMatch = true;
      
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (max) {
          priceMatch = productPrice >= min && productPrice <= max;
        } else {
          priceMatch = productPrice >= min;
        }
      }
      
      const isVisible = categoryMatch && priceMatch;
      product.style.display = isVisible ? 'block' : 'none';
      
      // Add fade animation
      if (isVisible) {
        product.style.opacity = '0';
        setTimeout(() => {
          product.style.opacity = '1';
        }, 50);
      }
    });

    // Show/hide no results message
    const visibleProducts = document.querySelectorAll('.product-card[style="display: block"]');
    const noResults = document.getElementById('no-results');
    
    if (visibleProducts.length === 0) {
      if (!noResults) {
        const message = document.createElement('div');
        message.id = 'no-results';
        message.className = 'no-results';
        message.innerHTML = `
          <i class="fas fa-search"></i>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button type="button" class="reset-filters">Reset Filters</button>
        `;
        document.querySelector('.shop-grid').appendChild(message);
        
        // Add reset functionality
        message.querySelector('.reset-filters').addEventListener('click', () => {
          document.getElementById('category-filter').value = '';
          document.getElementById('price-range').value = '';
          document.getElementById('product-search').value = '';
          this.filterProducts();
        });
      }
    } else {
      noResults?.remove();
    }
  }

  sortProducts(event) {
    const sortBy = event.target.value;
    const productGrid = document.querySelector('.shop-grid');
    const products = Array.from(productGrid.children).filter(el => el.classList.contains('product-card'));
    
    // Remove no results message if present
    document.getElementById('no-results')?.remove();

    products.sort((a, b) => {
      const priceA = parseFloat(a.dataset.price);
      const priceB = parseFloat(b.dataset.price);
      const nameA = a.querySelector('h3').textContent.toLowerCase();
      const nameB = b.querySelector('h3').textContent.toLowerCase();
      const categoryA = a.dataset.category;
      const categoryB = b.dataset.category;

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'category':
          return categoryA.localeCompare(categoryB);
        default:
          return 0;
      }
    });

    // Animate the reordering
    products.forEach((product, index) => {
      product.style.order = index;
      product.style.opacity = '0';
      setTimeout(() => {
        product.style.opacity = '1';
      }, 50 * index);
    });
  }

  handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const products = document.querySelectorAll('.product-card');
    let hasResults = false;

    products.forEach(product => {
      const name = product.querySelector('h3').textContent.toLowerCase();
      const description = product.querySelector('.product-description').textContent.toLowerCase();
      const category = product.dataset.category.toLowerCase();
      
      const isVisible = name.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       category.includes(searchTerm);
      
      product.style.display = isVisible ? 'block' : 'none';
      
      if (isVisible) {
        hasResults = true;
        // Highlight matching text
        if (searchTerm) {
          const nameElement = product.querySelector('h3');
          const descElement = product.querySelector('.product-description');
          
          nameElement.innerHTML = nameElement.textContent.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
          );
          
          descElement.innerHTML = descElement.textContent.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
          );
        }
      }
    });

    // Show/hide no results message
    const noResults = document.getElementById('no-results');
    if (!hasResults && !noResults) {
      const message = document.createElement('div');
      message.id = 'no-results';
      message.className = 'no-results';
      message.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>No products found</h3>
        <p>Try different search terms</p>
        <button type="button" class="clear-search">Clear Search</button>
      `;
      document.querySelector('.shop-grid').appendChild(message);
      
      // Add clear search functionality
      message.querySelector('.clear-search').addEventListener('click', () => {
        document.getElementById('product-search').value = '';
        this.handleSearch({ target: { value: '' } });
      });
    } else if (hasResults) {
      noResults?.remove();
    }
  }

  checkout() {
    // Implement checkout functionality
    alert('Checkout functionality coming soon!');
  }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const cart = new ShoppingCart();

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', 
        menuToggle.classList.contains('active'));
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuToggle.contains(e.target) && 
          !navLinks.contains(e.target) && 
          navLinks.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll to top button functionality
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'flex';
      } else {
        scrollTopBtn.style.display = 'none';
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Navigation scroll effect
  const navContainer = document.querySelector('.nav-container');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navContainer.classList.add('scrolled');
    } else {
      navContainer.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  const menuButton = document.querySelector('.menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  if (menuButton) {
    menuButton.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
      menuButton.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinksContainer && navLinksContainer.classList.contains('active')) {
      if (!e.target.closest('.nav-links') && !e.target.closest('.menu-toggle')) {
        navLinksContainer.classList.remove('active');
        if (menuButton) {
          menuButton.classList.remove('active');
        }
      }
    }
  });
});

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Add event listeners to all add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    console.log('Found add to cart buttons:', addToCartButtons.length);
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.dataset.productId;
            const productName = productCard.querySelector('h4').textContent;
            const price = parseFloat(productCard.dataset.price);
            
            console.log('Button clicked:', { productId, productName, price });
            handleAddToCart(productId, productName, price);
        });
    });
    
    // Initialize cart count
    updateCartCount();
});

function handleAddToCart(productId, productName, price) {
    console.log('Handling add to cart:', { productId, productName, price });
    
    // Update cart in localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Update UI
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    console.log('Found product card:', productCard);
    
    if (productCard) {
        // Hide the original button
        const originalButton = productCard.querySelector('.add-to-cart');
        originalButton.style.display = 'none';
        
        // Create and show the split buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        // Create proceed button
        const proceedBtn = document.createElement('button');
        proceedBtn.className = 'proceed-btn';
        proceedBtn.textContent = 'Proceed to Checkout';
        proceedBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.addEventListener('click', () => {
            handleRemoveFromCart(productId, productCard, buttonContainer);
        });
        
        buttonContainer.appendChild(proceedBtn);
        buttonContainer.appendChild(removeBtn);
        productCard.appendChild(buttonContainer);
        
        // Show the buttons with animation
        requestAnimationFrame(() => {
            buttonContainer.classList.add('show');
        });
    }
}

function handleRemoveFromCart(productId, productCard, buttonContainer) {
    console.log('Removing from cart:', productId);
    
    // Update cart in localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCartCount();
    
    // Update UI
    buttonContainer.classList.remove('show');
    setTimeout(() => {
        buttonContainer.remove();
        const originalButton = productCard.querySelector('.add-to-cart');
        originalButton.style.display = 'block';
    }, 300);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
        
        // Close mobile menu when clicking a link
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
});
