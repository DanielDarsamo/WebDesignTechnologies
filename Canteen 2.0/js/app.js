/**
 * Main Application Module
 */
const App = (function(UI, Cart,Order) {
    // DOM elements
    const DOM = UI.getDOMElements();
    
    // Setup event listeners
    const setupEventListeners = function() {
        // Category buttons
        DOM.categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active button
                DOM.categoryBtns.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Show section
                DOM.menuSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${category}-section`) {
                        section.classList.add('active');
                    }
                });
            });
        });
        
        // Add to cart buttons
        DOM.addBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent opening modal
                
                const itemId = parseInt(this.getAttribute('data-id'));
                Cart.addToCart(itemId, 1);
                
                // Show success animation
                this.textContent = '✓';
                this.classList.add('added');
                
                setTimeout(() => {
                    this.textContent = '+';
                    this.classList.remove('added');
                }, 1000);
                
                // Show notification
                UI.showNotification(translations[UI.getCurrentLanguage()].itemAdded);
            });
        });
        
        // Show item details on item click
        DOM.menuItems.forEach(item => {
            item.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                
                // Find item in menu data
                let itemData = null;
                for (const category in menuData) {
                    const foundItem = menuData[category].find(item => item.id === itemId);
                    if (foundItem) {
                        itemData = foundItem;
                        break;
                    }
                }
                
                if (itemData) {
                    UI.showItemDetails(itemData);
                }
            });
        });
        
        // Close modal button
        DOM.closeModalBtn.addEventListener('click', () => UI.closeItemDetails());
        
        // Close modal when clicking outside
        DOM.itemDetailModal.addEventListener('click', function(e) {
            if (e.target === this) {
                UI.closeItemDetails();
            }
        });
        
        // Quantity buttons in modal
        DOM.decreaseQuantityBtn.addEventListener('click', () => UI.decreaseQuantity());
        DOM.increaseQuantityBtn.addEventListener('click', () => UI.increaseQuantity());
        
        // Add to cart button in modal
        DOM.addToCartBtn.addEventListener('click', function() {
            const { item, quantity } = UI.getCurrentItemDetails();
            
            if (item && quantity > 0) {
                Cart.addToCart(item.id, quantity);
                UI.showNotification(translations[UI.getCurrentLanguage()].itemAdded);
                UI.closeItemDetails();
            }
        });
        
      

        
        // Toggle cart sidebar
        DOM.cartNavBtn.addEventListener('click', () => UI.toggleCart(true));
        DOM.closeCartBtn.addEventListener('click', () => UI.toggleCart(false));
        
        // Toggle active order panel
        DOM.orderNavBtn.addEventListener('click', () => {
            if (Order.hasActiveOrder()) {
                UI.toggleActiveOrder(true);
            } else {
                UI.showNotification(translations[UI.getCurrentLanguage()].noActiveOrder, 'info');
            }
        });
        DOM.closePanelBtn.addEventListener('click', () => UI.toggleActiveOrder(false));
        
        // Bottom navigation
        DOM.bottomNavBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const page = this.getAttribute('data-page');
                
                // Update active button
                DOM.bottomNavBtns.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Handle navigation
                if (page === 'cart') {
                    UI.toggleCart(true);
                } else if (page === 'order' && Order.hasActiveOrder()) {
                    UI.toggleActiveOrder(true);
                }
            });
        });
        
        // Checkout button
        DOM.checkoutBtn.addEventListener('click', function() {
            if (Cart.isCartEmpty()) {
                UI.showNotification(translations[UI.getCurrentLanguage()].emptyCart, 'error');
                return;
            }
            
            // Create new order
            const cart = Cart.getCart();
            const newOrder = Order.createOrder(cart);
            
            if (newOrder) {
                // Clear cart and show success message
                Cart.clearCart();
                UI.showNotification(translations[UI.getCurrentLanguage()].orderPlaced, 'success');
                UI.toggleCart(false);
                
                // Show active order panel
                setTimeout(() => UI.toggleActiveOrder(true), 500);
            }
        });
        
        // Language toggle
        DOM.languageToggle.addEventListener('change', function() {
            const language = this.checked ? 'pt' : 'en';
            UI.setLanguage(language);
        });
        
        // Dark mode toggle
        DOM.darkModeToggle.addEventListener('change', function() {
            UI.toggleDarkMode(this.checked);
            localStorage.setItem('darkMode', this.checked);
        });
    };
    
    // Initialize app
    const init = function() {
        // Load dark mode from storage
        const darkMode = localStorage.getItem('darkMode') === 'true';
        UI.toggleDarkMode(darkMode);
        DOM.darkModeToggle.checked = darkMode;
        
        // Initialize controllers
        Cart.init();
        Order.init();
        
        // Set initial language
        UI.setLanguage('en');
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('Darsamo Bites app initialized');
    };
    
    // Return public methods
    return {
        init: init
    };
})(UIController, CartController, OrderController);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', App.init);