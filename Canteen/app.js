/**
 * DARSAMO BITES - Main Application
 * @version 2.1.3
 * @description UI handlers and event listeners for the cafeteria menu application
 */

// Initialize the order system
const orderSystem = new OrderSystem();

// DOM Elements
const elements = {
    darkModeToggle: document.getElementById('darkModeToggle'),
    languageToggle: document.getElementById('languageToggle'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    menuSections: document.querySelectorAll('.menu-section'),
    cartItemsContainer: document.getElementById('cartItems'),
    cartTotalElement: document.getElementById('cartTotal'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    cartToggle: document.querySelector('.cart-toggle'),
    activeOrdersToggle: document.getElementById('activeOrdersToggle'),
    cartContainer: document.querySelector('.cart-container'),
    cartCloseBtn: document.querySelector('.cart-close-btn'),
    addButtons: document.querySelectorAll('.add-btn'),
    modalTitle: document.getElementById('modalTitle'),
    modalItems: document.getElementById('modalItems'),
    modalTotal: document.getElementById('modalTotal'),
    confirmPickupBtn: document.querySelector('.confirm-pickup'),
    orderCompletionModal: document.querySelector('.order-completion-modal'),
    activeOrdersPanel: document.getElementById('activeOrdersPanel'),
    panelContent: document.getElementById('panelContent')
};

/**
 * Notification System
 */
const notificationSystem = {
    container: document.querySelector('.notification-container'),
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info, warning)
     */
    show(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.container.appendChild(notification);
        setTimeout(() => notification.classList.add('active'), 50);
        
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

/**
 * UI Update Functions
 */
const uiUpdates = {
    /**
     * Update all UI components
     */
    updateAll() {
        this.updateCartDisplay();
        this.updateActiveOrdersBadge();
        this.updateCheckoutButton();
        this.applyTranslations();
    },
    
    /**
     * Update cart display with current items
     */
    updateCartDisplay() {
        const cart = orderSystem.getCart();
        const translations = orderSystem.getCurrentTranslations();
        
        elements.cartItemsContainer.innerHTML = cart.length === 0
            ? `<p class="empty-cart-message">${translations.emptyCart}</p>`
            : cart.map(item => `
                <div class="cart-item">
                    <span class="cart-item-name">${item.name}</span>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-name="${item.name}">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-name="${item.name}">+</button>
                        <span class="cart-item-price">${item.price * item.quantity} MZN</span>
                    </div>
                </div>
            `).join('');

        elements.cartTotalElement.textContent = `${orderSystem.getCartTotal()} MZN`;
        document.querySelector('.cart-count').textContent = orderSystem.getCartItemCount();

        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemName = this.dataset.name;
                const change = this.classList.contains('plus') ? 1 : -1;
                orderSystem.updateCartItemQuantity(itemName, change);
                uiUpdates.updateAll();
            });
        });
    },
    
    /**
     * Update the checkout button based on editing state
     */
    updateCheckoutButton() {
        const translations = orderSystem.getCurrentTranslations();
        const isEditing = orderSystem.isEditingOrder();
        
        elements.checkoutBtn.textContent = isEditing ? 
            translations.updateOrder : translations.checkout;
        
        elements.checkoutBtn.style.backgroundColor = isEditing ? 
            '#ff9800' : '';
    },
    
    /**
     * Update active orders count badge
     */
    updateActiveOrdersBadge() {
        const activeOrders = orderSystem.getActiveOrders();
        const activeCount = activeOrders.length;
        
        elements.activeOrdersToggle.style.display = activeCount > 0 ? 'flex' : 'none';
        document.querySelector('.orders-count').textContent = activeCount;
    },
    
    /**
     * Apply translations to UI elements
     */
    applyTranslations() {
        const translations = orderSystem.getCurrentTranslations();
        
        // Find all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[key]) {
                if (el.tagName === 'INPUT') {
                    el.placeholder = translations[key];
                } else {
                    el.textContent = translations[key];
                }
            }
        });
        
        // Special case for cart title with close button
        const cartTitle = document.querySelector('.cart h2');
        if (cartTitle) {
            cartTitle.innerHTML = `${translations.cartTitle} <span class="cart-close-btn">×</span>`;
            
            // Reattach event listener
            document.querySelector('.cart-close-btn').addEventListener('click', () => {
                elements.cartContainer.classList.remove('show-cart');
            });
        }
    },
    
    /**
     * Show completion modal for a ready order
     * @param {Object} order - Order object
     */
    showCompletionModal(order) {
        const translations = orderSystem.getCurrentTranslations();
        
        elements.modalTitle.textContent = translations.orderReady;
        elements.modalItems.innerHTML = order.items.map(item => `
            <div class="modal-item">
                <span>${item.name}</span>
                <span>× ${item.quantity}</span>
                <span>${item.price * item.quantity} MZN</span>
            </div>
        `).join('');
        elements.modalTotal.textContent = `${translations.total} ${order.total} MZN`;
        elements.orderCompletionModal.style.display = 'block';
        elements.orderCompletionModal.setAttribute('data-order-id', order.id);
    },
    
    /**
     * Close completion modal
     */
    closeCompletionModal() {
        elements.orderCompletionModal.style.display = 'none';
    },
    
    /**
     * Show panel with active orders
     */
    showActiveOrdersPanel() {
        const activeOrders = orderSystem.getActiveOrders();
        const translations = orderSystem.getCurrentTranslations();
        
        if (activeOrders.length === 0) {
            notificationSystem.show(translations.noActiveOrders, 'info');
            return;
        }
        
        elements.panelContent.innerHTML = activeOrders.map(order => `
            <div class="panel-order" data-order-id="${order.id}">
                <div class="panel-order-header">
                    <h4>${translations.order} #${order.id}</h4>
                    <span class="order-status ${order.status}">
                        ${translations[`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`]}
                    </span>
                </div>
                <div class="panel-order-time">
                    ${orderSystem.formatTimeLeft(order.estimatedReady - Date.now())}
                </div>
                <ul class="order-items">
                    ${order.items.slice(0, 2).map(item => `
                        <li>${item.name} × ${item.quantity}</li>
                    `).join('')}
                    ${order.items.length > 2 ? `<li>+${order.items.length - 2} ${translations.moreItems}</li>` : ''}
                </ul>
                <div class="panel-order-actions">
                    ${(order.status === 'pending' || order.status === 'preparing') ? `
                        <button class="panel-edit-btn">${translations.edit}</button>
                        <button class="panel-add-btn">${translations.addItems}</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        if (activeOrders.length === 0) {
            elements.panelContent.innerHTML = `<p class="empty-orders">${translations.noActiveOrders}</p>`;
        }
        
        elements.activeOrdersPanel.style.display = 'block';
        
        // Add event listeners
        document.querySelectorAll('.panel-edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = parseInt(this.closest('.panel-order').dataset.orderId);
                if (orderSystem.startEditingOrder(orderId)) {
                    elements.activeOrdersPanel.style.display = 'none';
                    elements.cartContainer.classList.add('show-cart');
                    uiUpdates.updateAll();
                    notificationSystem.show(
                        translations.editingOrder.replace('{id}', orderId), 
                        'info'
                    );
                } else {
                    notificationSystem.show(translations.editExpired, 'error');
                }
            });
        });
        
        document.querySelectorAll('.panel-add-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                elements.activeOrdersPanel.style.display = 'none';
                elements.cartContainer.classList.add('show-cart');
                this.dataset.targetOrderId = this.closest('.panel-order').dataset.orderId;
            });
        });
    },
    
    /**
     * Hide active orders panel
     */
    hideActiveOrdersPanel() {
        elements.activeOrdersPanel.style.display = 'none';
    }
};

/**
 * Event Handlers
 */
function setupEventListeners() {
    // Dark mode toggle
    elements.darkModeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
        localStorage.setItem('darkMode', this.checked);
    });

    // Language toggle
    elements.languageToggle.addEventListener('change', function() {
        const newLanguage = this.checked ? 'pt' : 'en';
        orderSystem.setLanguage(newLanguage);
        uiUpdates.updateAll();
    });

    // Category navigation
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            document.querySelector('.menu-section.active-section').classList.remove('active-section');
            document.querySelector('.category-btn.active').classList.remove('active');
            this.classList.add('active');
            document.getElementById(`${category}-section`).classList.add('active-section');
        });
    });

    // Add to cart buttons
    elements.addButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            const itemName = this.dataset.name;
            const itemPrice = parseInt(this.dataset.price);
            orderSystem.addToCart(itemName, itemPrice);
            
            // Button animation
            this.textContent = '✓';
            this.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                this.textContent = '+';
                this.style.backgroundColor = '';
            }, 1000);
            
            const translations = orderSystem.getCurrentTranslations();
            notificationSystem.show(`${itemName} ${translations.addedToCart}`, 'success');
            uiUpdates.updateAll();
        });
    });

    // Checkout button
    elements.checkoutBtn.addEventListener('click', function() {
        const translations = orderSystem.getCurrentTranslations();
        
        if (orderSystem.getCartItemCount() === 0) {
            notificationSystem.show(translations.emptyCartWarning, 'error');
            return;
        }

        // If we're editing an existing order
        if (orderSystem.isEditingOrder()) {
            const updatedOrder = orderSystem.updateEditingOrder();
            if (updatedOrder) {
                notificationSystem.show(
                    translations.orderUpdated.replace('{id}', updatedOrder.id), 
                    'success'
                );
                elements.cartContainer.classList.remove('show-cart');
                uiUpdates.updateAll();
                return;
            }
        }

        // If no active orders, create a new one directly
        const activeOrders = orderSystem.getActiveOrders();
        if (activeOrders.length === 0) {
            const newOrder = orderSystem.createNewOrder();
            if (newOrder) {
                notificationSystem.show(
                    translations.orderCreated.replace('{id}', newOrder.id), 
                    'success'
                );
                elements.cartContainer.classList.remove('show-cart');
                uiUpdates.updateAll();
            }
            return;
        }

        // If there are active orders, ask if they want to create new or add to existing
        const choice = confirm(translations.createNewOrderPrompt);
        if (choice) {
            const newOrder = orderSystem.createNewOrder();
            if (newOrder) {
                notificationSystem.show(
                    translations.orderCreated.replace('{id}', newOrder.id), 
                    'success'
                );
                elements.cartContainer.classList.remove('show-cart');
            }
        } else {
            uiUpdates.showActiveOrdersPanel();
        }
        
        uiUpdates.updateAll();
    });

    // Cart toggle
    elements.cartToggle.addEventListener('click', () => {
        elements.cartContainer.classList.add('show-cart');
    });

    // Active orders toggle
    elements.activeOrdersToggle.addEventListener('click', () => {
        uiUpdates.showActiveOrdersPanel();
    });

    // Cart close button
    elements.cartCloseBtn.addEventListener('click', () => {
        elements.cartContainer.classList.remove('show-cart');
    });

    // Confirm pickup button
    elements.confirmPickupBtn.addEventListener('click', () => {
        const orderId = parseInt(elements.orderCompletionModal.getAttribute('data-order-id'));
        if (orderId) {
            orderSystem.completeOrder(orderId);
        }
        uiUpdates.closeCompletionModal();
        uiUpdates.updateAll();
    });

    // Close modal when clicking outside
    elements.orderCompletionModal.addEventListener('click', (e) => {
        if (e.target === elements.orderCompletionModal) {
            uiUpdates.closeCompletionModal();
        }
    });
    
    // Close active orders panel
    document.querySelector('.close-panel').addEventListener('click', () => {
        uiUpdates.hideActiveOrdersPanel();
    });
    
    // Order ready event listener
    document.addEventListener('orderReady', (e) => {
        uiUpdates.showCompletionModal(e.detail);
        uiUpdates.updateAll();
    });
    
    // Panel add to order button - after clicking add items
    elements.checkoutBtn.addEventListener('targetOrderSelected', function(e) {
        if (e.detail && e.detail.orderId) {
            const order = orderSystem.addToOrder(parseInt(e.detail.orderId));
            if (order) {
                const translations = orderSystem.getCurrentTranslations();
                notificationSystem.show(
                    translations.itemsAdded.replace('{id}', order.id), 
                    'success'
                );
                elements.cartContainer.classList.remove('show-cart');
                uiUpdates.updateAll();
            }
        }
    });
    
    // Listen for add to existing order
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('panel-add-btn')) {
            const orderId = parseInt(e.target.closest('.panel-order').dataset.orderId);
            elements.activeOrdersPanel.style.display = 'none';
            elements.cartContainer.classList.add('show-cart');
            
            // Save the target order ID for checkout
            elements.checkoutBtn.dataset.targetOrderId = orderId;
            
            // Change checkout button behavior
            const translations = orderSystem.getCurrentTranslations();
            elements.checkoutBtn.textContent = translations.addItems;
            
            // Override checkout button click just once
            const originalClickHandler = elements.checkoutBtn.onclick;
            elements.checkoutBtn.onclick = function(event) {
                event.preventDefault();
                
                const targetOrderId = parseInt(this.dataset.targetOrderId);
                if (targetOrderId) {
                    const order = orderSystem.addToOrder(targetOrderId);
                    if (order) {
                        notificationSystem.show(
                            translations.itemsAdded.replace('{id}', order.id), 
                            'success'
                        );
                        elements.cartContainer.classList.remove('show-cart');
                        uiUpdates.updateAll();
                    }
                    
                    // Restore original behavior
                    delete this.dataset.targetOrderId;
                    this.onclick = originalClickHandler;
                    uiUpdates.updateCheckoutButton();
                }
            };
        }
    });
    
    // Timer to update order times
    setInterval(() => {
        const activeOrderElements = document.querySelectorAll('.panel-order');
        activeOrderElements.forEach(el => {
            const orderId = parseInt(el.dataset.orderId);
            const order = orderSystem.getActiveOrders().find(o => o.id === orderId);
            if (order && order.estimatedReady) {
                const timeElement = el.querySelector('.panel-order-time');
                if (timeElement) {
                    timeElement.textContent = orderSystem.formatTimeLeft(order.estimatedReady - Date.now());
                }
            }
        });
    }, 1000);
}

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme from localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        elements.darkModeToggle.checked = true;
    }
    
    // Initialize language toggle
    const currentLanguage = orderSystem.state.currentLanguage;
    elements.languageToggle.checked = currentLanguage === 'pt';
    
    // Hide active orders panel initially
    elements.activeOrdersPanel.style.display = 'none';
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial UI update
    uiUpdates.updateAll();
});