// Shopping Cart Class
class ShoppingCart {
    constructor() {
        // Clear the cart when initializing
        localStorage.removeItem('cart');
        this.items = [];
        this.loadCart();
        this.updateCartCount();
        this.renderCart();
    }

    loadCart() {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            // Add animation class
            cartCount.classList.add('bounce');
            setTimeout(() => cartCount.classList.remove('bounce'), 300);
        }
    }

    addToCart(product) {
        const existingItem = this.items.find(item => item.productId === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.showNotification('Item added to cart');
    }

    removeItem(productId) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            this.items = this.items.filter(item => item.productId !== productId);
            this.saveCart();
            this.updateCartCount();
            this.renderCart();
            this.showNotification('Item removed from cart');
        }
    }

    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            if (newQuantity > 0) {
                item.quantity = newQuantity;
            } else {
                this.removeItem(productId);
                return;
            }
            this.saveCart();
            this.updateCartCount();
            this.renderCart();
        }
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
            <div class="cart-item" data-product-id="${item.productId}">
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
                <button type="button" class="remove-item" aria-label="Remove item">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Calculate totals
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

        // Attach event listeners after rendering
        this.attachCartEventListeners();
    }

    attachCartEventListeners() {
        // Remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                if (cartItem) {
                    const productId = cartItem.dataset.productId;
                    this.removeItem(productId);
                }
            });
        });

        // Quantity controls
        document.querySelectorAll('.cart-item-quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                const cartItem = e.target.closest('.cart-item');
                if (cartItem) {
                    const productId = cartItem.dataset.productId;
                    const newQuantity = parseInt(e.target.value);
                    this.updateQuantity(productId, newQuantity);
                }
            });
        });

        // Plus/Minus buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                if (cartItem) {
                    const input = cartItem.querySelector('.cart-item-quantity');
                    const productId = cartItem.dataset.productId;
                    const currentValue = parseInt(input.value);
                    
                    if (e.target.classList.contains('plus')) {
                        input.value = currentValue + 1;
                    } else if (e.target.classList.contains('minus')) {
                        input.value = Math.max(1, currentValue - 1);
                    }
                    
                    this.updateQuantity(productId, parseInt(input.value));
                }
            });
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Add animation classes
        notification.classList.add('fade-in');
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2700);
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});

// Add to cart buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            const product = {
                id: productCard.dataset.productId,
                name: productCard.querySelector('h4').textContent,
                price: parseFloat(productCard.dataset.price),
                image: productCard.querySelector('img').src
            };
            window.cart.addToCart(product);
        }
    }
});

// Scroll to top button
const scrollTopBtn = document.querySelector('.scroll-top');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
} 