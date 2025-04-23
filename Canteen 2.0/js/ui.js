/**
 * UI Controller - Handles all UI interactions and rendering
 */
const UIController = (function() {
    // DOM elements
    const DOMElements = {
        // Containers and sections
        menuSections: document.querySelectorAll('.menu-section'),
        notificationContainer: document.getElementById('notificationContainer'),
        cartSidebar: document.getElementById('cartSidebar'),
        activeOrderPanel: document.getElementById('activeOrderPanel'),
        
        // Navigation
        categoryBtns: document.querySelectorAll('.category-btn'),
        bottomNavBtns: document.querySelectorAll('.nav-item'),
        cartNavBtn: document.getElementById('cartNavBtn'),
        orderNavBtn: document.getElementById('orderNavBtn'),
        
        // Controls
        darkModeToggle: document.getElementById('darkModeToggle'),
        languageToggle: document.getElementById('languageToggle'),
        
        // Cart elements
        cartItems: document.getElementById('cartItems'),
        cartTotal: document.getElementById('cartTotal'),
        cartBadge: document.getElementById('cartBadge'),
        checkoutBtn: document.getElementById('checkoutBtn'),
        closeCartBtn: document.querySelector('.close-cart'),
        
        // Menu items
        menuItems: document.querySelectorAll('.menu-item'),
        addBtns: document.querySelectorAll('.add-btn'),
        favoriteBtns: document.querySelectorAll('.favorite-btn'),
        
        // Modal elements
        itemDetailModal: document.getElementById('itemDetailModal'),
        closeModalBtn: document.querySelector('.close-modal'),
        modalItemImg: document.getElementById('modalItemImg'),
        modalItemName: document.getElementById('modalItemName'),
        modalItemDesc: document.getElementById('modalItemDesc'),
        modalItemPrice: document.getElementById('modalItemPrice'),
        modalItemCalories: document.getElementById('modalItemCalories'),
        modalItemTime: document.getElementById('modalItemTime'),
        modalIngredients: document.getElementById('modalIngredients'),
        modalFavoriteBtn: document.querySelector('.modal-favorite-btn'),
        decreaseQuantityBtn: document.getElementById('decreaseQuantity'),
        increaseQuantityBtn: document.getElementById('increaseQuantity'),
        itemQuantity: document.getElementById('itemQuantity'),
        addToCartBtn: document.getElementById('addToCartBtn'),
        
        // Order elements
        activeOrderItems: document.getElementById('activeOrderItems'),
        activeOrderTotal: document.getElementById('activeOrderTotal'),
        estimatedTime: document.getElementById('estimatedTime'),
        progressSteps: document.querySelectorAll('.progress-step'),
        progressLines: document.querySelectorAll('.progress-line'),
        closePanelBtn: document.querySelector('.close-panel')
    };

    // Current state
    let currentLanguage = 'en';
    let currentQuantity = 1;
    let currentItem = null;

    // Public methods
    return {
        // Get DOM elements
        getDOMElements: function() {
            return DOMElements;
        },

        // Switch language
        setLanguage: function(language) {
            currentLanguage = language;
            const elements = document.querySelectorAll('[data-translate]');
            
            elements.forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[language][key]) {
                    if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                        element.placeholder = translations[language][key];
                    } else {
                        element.textContent = translations[language][key];
                    }
                }
            });
            
            document.documentElement.setAttribute('data-lang', language);
        },

        // Toggle dark mode
        toggleDarkMode: function(isDark) {
            if (isDark) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        },
        
        // Show notification
        showNotification: function(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            DOMElements.notificationContainer.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.remove();
            }, 3500);
        },
        
        // Show item details in modal
        showItemDetails: function(itemData) {
            currentItem = itemData;
            currentQuantity = 1;
            
            // Set modal content
            DOMElements.modalItemImg.src = itemData.image;
            DOMElements.modalItemImg.alt = itemData.name;
            DOMElements.modalItemName.textContent = itemData.name;
            DOMElements.modalItemDesc.textContent = itemData.longDescription;
            DOMElements.modalItemPrice.textContent = `$${itemData.price.toFixed(2)}`;
            DOMElements.modalItemCalories.textContent = itemData.calories;
            DOMElements.modalItemTime.textContent = itemData.prepTime;
            DOMElements.itemQuantity.textContent = currentQuantity;
            
            // Check if item is in favorites
            const isFavorite = FavoritesController.isFavorite(itemData.id);
            if (isFavorite) {
                DOMElements.modalFavoriteBtn.classList.add('active');
            } else {
                DOMElements.modalFavoriteBtn.classList.remove('active');
            }
            
            // Update add to cart button with item id
            DOMElements.addToCartBtn.setAttribute('data-id', itemData.id);
            
            // Generate ingredients list
            DOMElements.modalIngredients.innerHTML = '';
            itemData.ingredients.forEach(ingredient => {
                const ingredientEl = document.createElement('div');
                ingredientEl.className = 'ingredient';
                ingredientEl.innerHTML = `
                    <span class="ingredient-icon">${ingredient.icon}</span>
                    <span>${ingredient.name}</span>
                `;
                DOMElements.modalIngredients.appendChild(ingredientEl);
            });
            
            // Enable/disable quantity buttons
            this.updateQuantityButtons();
            
            // Show modal
            DOMElements.itemDetailModal.classList.add('show');
        },
        
        // Close item details modal
        closeItemDetails: function() {
            DOMElements.itemDetailModal.classList.remove('show');
            currentItem = null;
            currentQuantity = 1;
        },
        
        // Increase item quantity
        increaseQuantity: function() {
            currentQuantity += 1;
            DOMElements.itemQuantity.textContent = currentQuantity;
            this.updateQuantityButtons();
        },
        
        // Decrease item quantity
        decreaseQuantity: function() {
            if (currentQuantity > 1) {
                currentQuantity -= 1;
                DOMElements.itemQuantity.textContent = currentQuantity;
                this.updateQuantityButtons();
            }
        },
        
        // Update quantity buttons state
        updateQuantityButtons: function() {
            DOMElements.decreaseQuantityBtn.disabled = currentQuantity <= 1;
        },
        
        // Update cart UI
        updateCartUI: function(cart) {
            const cartItemsEl = DOMElements.cartItems;
            const cartTotalEl = DOMElements.cartTotal;
            const cartBadgeEl = DOMElements.cartBadge;
            
            // Clear cart items
            cartItemsEl.innerHTML = '';
            
            // Calculate total items
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartBadgeEl.textContent = totalItems;
            
            // If cart is empty
            if (cart.length === 0) {
                cartItemsEl.innerHTML = `<p class="empty-cart">${translations[currentLanguage].emptyCart}</p>`;
                cartTotalEl.textContent = '$0.00';
                return;
            }
            
            // Add items to cart UI
            let totalPrice = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.innerHTML = `
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="cart-quantity-btn minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="cart-quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                `;
                
                cartItemsEl.appendChild(cartItemEl);
            });
            
            // Update total
            cartTotalEl.textContent = `$${totalPrice.toFixed(2)}`;
            
            // Add event listeners to quantity buttons
            cartItemsEl.querySelectorAll('.cart-quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemId = parseInt(this.getAttribute('data-id'));
                    CartController.decreaseItemQuantity(itemId);
                });
            });
            
            cartItemsEl.querySelectorAll('.cart-quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemId = parseInt(this.getAttribute('data-id'));
                    CartController.increaseItemQuantity(itemId);
                });
            });
        },
        
        // Toggle cart sidebar
        toggleCart: function(show) {
            if (show) {
                DOMElements.cartSidebar.classList.add('show');
            } else {
                DOMElements.cartSidebar.classList.remove('show');
            }
        },
        
        // Show active order panel
        updateActiveOrderUI: function(order) {
            if (!order) {
                return;
            }
            
            // Update order items
            const orderItemsEl = DOMElements.activeOrderItems;
            orderItemsEl.innerHTML = '';
            
            order.items.forEach(item => {
                const orderItemEl = document.createElement('div');
                orderItemEl.className = 'order-item';
                orderItemEl.innerHTML = `
                    <span>${item.name} × ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                `;
                
                orderItemsEl.appendChild(orderItemEl);
            });
            
            // Update order total
            DOMElements.activeOrderTotal.textContent = `$${order.total.toFixed(2)}`;
            
            // Update estimated time
            const estimatedTime = new Date(order.estimatedReadyTime);
            DOMElements.estimatedTime.textContent = estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Update progress
            const progressSteps = DOMElements.progressSteps;
            const progressLines = DOMElements.progressLines;
            
            // Reset all steps first
            progressSteps.forEach(step => {
                step.classList.remove('current', 'completed');
            });
            
            progressLines.forEach(line => {
                line.classList.remove('active');
            });
            
            // Set current step
            switch (order.status) {
                case 'pending':
                    progressSteps[0].classList.add('current');
                    break;
                    
                case 'preparing':
                    progressSteps[0].classList.add('completed');
                    progressSteps[1].classList.add('current');
                    progressLines[0].classList.add('active');
                    break;
                    
                case 'ready':
                    progressSteps[0].classList.add('completed');
                    progressSteps[1].classList.add('completed');
                    progressSteps[2].classList.add('current');
                    progressLines[0].classList.add('active');
                    progressLines[1].classList.add('active');
                    
                    // Show notification if needed
                    if (!order.notified) {
                        this.showNotification(translations[currentLanguage].orderReady, 'success');
                        order.notified = true;
                    }
                    break;
            }
        },
        
        // Toggle active order panel
        toggleActiveOrder: function(show) {
            if (show) {
                DOMElements.activeOrderPanel.classList.add('show');
            } else {
                DOMElements.activeOrderPanel.classList.remove('show');
            }
        },
        
        // Update favorites UI
        updateFavoritesUI: function(favorites) {
            // Update favorite buttons in menu
            DOMElements.favoriteBtns.forEach(btn => {
                const menuItem = btn.closest('.menu-item');
                const itemId = parseInt(menuItem.getAttribute('data-id'));
                
                if (favorites.includes(itemId)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        },
        
        // Get current item and quantity
        getCurrentItemDetails: function() {
            return {
                item: currentItem,
                quantity: currentQuantity
            };
        },
        
        // Get current language
        getCurrentLanguage: function() {
            return currentLanguage;
        }
    };
})();