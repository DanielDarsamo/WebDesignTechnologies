/**
 * DARSAMO BITES - Order Management System
 * @version 2.1.3
 * @description Core order processing, tracking, and management functionality
 */

class OrderSystem {
    constructor() {
        this.state = {
            activeOrders: [],
            currentCart: [],
            nextOrderId: 1,
            editingOrderId: null,
            currentLanguage: 'en',
            orderTimers: {}
        };
        
        this.initializeState();
    }

    /**
     * Initialize the state from localStorage if available
     */
    initializeState() {
        if (localStorage.getItem('darsamoState')) {
            try {
                const savedState = JSON.parse(localStorage.getItem('darsamoState'));
                this.state = {
                    ...this.state,
                    ...savedState,
                    currentLanguage: savedState.currentLanguage || 'en'
                };
                
                // Restore timers for in-progress orders
                this.state.activeOrders.forEach(order => {
                    if (order.status === 'preparing' && order.estimatedReady > Date.now()) {
                        this.startOrderTimer(order);
                    }
                });
            } catch (error) {
                console.error('Failed to load saved state:', error);
                localStorage.removeItem('darsamoState');
            }
        }
    }

    /**
     * Save current state to localStorage
     */
    persistState() {
        try {
            localStorage.setItem('darsamoState', JSON.stringify({
                activeOrders: this.state.activeOrders,
                currentCart: this.state.currentCart,
                nextOrderId: this.state.nextOrderId,
                editingOrderId: this.state.editingOrderId,
                currentLanguage: this.state.currentLanguage
            }));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    /**
     * Get the current language translations
     * @returns {Object} Translation strings for current language
     */
    getCurrentTranslations() {
        return translations[this.state.currentLanguage] || translations.en;
    }

    /**
     * Set the current language
     * @param {string} language - Language code ('en' or 'pt')
     */
    setLanguage(language) {
        if (translations[language]) {
            this.state.currentLanguage = language;
            this.persistState();
        }
    }

    /**
     * Get current cart items
     * @returns {Array} Cart items
     */
    getCart() {
        return [...this.state.currentCart];
    }

    /**
     * Get active orders (excluding picked up)
     * @returns {Array} Active orders
     */
    getActiveOrders() {
        return this.state.activeOrders.filter(o => o.status !== 'pickedUp');
    }

    /**
     * Get total number of items in cart
     * @returns {number} Total quantity
     */
    getCartItemCount() {
        return this.state.currentCart.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Calculate total price of items
     * @param {Array} items - Array of items with price and quantity
     * @returns {number} Total price
     */
    calculateTotal(items) {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    /**
     * Get cart total price
     * @returns {number} Total cart price
     */
    getCartTotal() {
        return this.calculateTotal(this.state.currentCart);
    }

    /**
     * Add item to cart
     * @param {string} name - Item name
     * @param {number} price - Item price
     * @returns {Object} Added item
     */
    addToCart(name, price) {
        const existingItem = this.state.currentCart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.currentCart.push({
                name,
                price: Number(price),
                quantity: 1
            });
        }
        
        this.persistState();
        return existingItem || this.state.currentCart[this.state.currentCart.length - 1];
    }

    /**
     * Update item quantity in cart
     * @param {string} name - Item name
     * @param {number} change - Quantity change (+1 or -1)
     */
    updateCartItemQuantity(name, change) {
        const item = this.state.currentCart.find(item => item.name === name);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.state.currentCart = this.state.currentCart.filter(i => i.name !== name);
        }
        
        this.persistState();
    }

    /**
     * Clear the cart
     */
    clearCart() {
        this.state.currentCart = [];
        this.state.editingOrderId = null;
        this.persistState();
    }

    /**
     * Determine order category based on items
     * @returns {string} Order category
     */
    determineOrderCategory() {
        const categories = new Set();
        this.state.currentCart.forEach(item => {
            const button = document.querySelector(`[data-name="${item.name}"]`);
            if (button) {
                const section = button.closest('.menu-section');
                if (section) {
                    categories.add(section.dataset.category);
                }
            }
        });
        
        return categories.size > 1 ? 'mixed' : categories.values().next().value || 'drinks';
    }

    /**
     * Calculate preparation time based on order category
     * @param {string} category - Order category
     * @returns {number} Preparation time in milliseconds
     */
    calculatePreparationTime(category) {
        const times = {
            'drinks': 5 * 1000,    // 5 seconds for demo
            'snacks': 5 * 1000,    // 5 seconds for demo
            'mixed': 20 * 1000     // 20 seconds for demo
        };
        return times[category] || 5 * 1000;
    }

    /**
     * Start order preparation timer
     * @param {Object} order - Order object
     */
    startOrderTimer(order) {
        // Clear any existing timer for this order
        this.clearOrderTimer(order.id);
        
        const preparationTime = this.calculatePreparationTime(order.category);
        order.estimatedReady = Date.now() + preparationTime;
        order.status = 'preparing';
        
        this.state.orderTimers[order.id] = setInterval(() => {
            const timeLeft = order.estimatedReady - Date.now();
            
            if (timeLeft <= 0) {
                order.status = 'ready';
                this.clearOrderTimer(order.id);
                this.persistState();
                
                // Trigger order ready notification
                const event = new CustomEvent('orderReady', { detail: order });
                document.dispatchEvent(event);
            }
        }, 1000);
    }

    /**
     * Clear order timer
     * @param {number} orderId - Order ID
     */
    clearOrderTimer(orderId) {
        if (this.state.orderTimers[orderId]) {
            clearInterval(this.state.orderTimers[orderId]);
            delete this.state.orderTimers[orderId];
        }
    }

    /**
     * Create a new order from current cart
     * @returns {Object} New order
     */
    createNewOrder() {
        if (this.state.currentCart.length === 0) {
            return null;
        }
        
        const newOrder = {
            id: this.state.nextOrderId++,
            items: [...this.state.currentCart],
            total: this.calculateTotal(this.state.currentCart),
            status: 'pending',
            createdAt: Date.now(),
            estimatedReady: null,
            category: this.determineOrderCategory()
        };

        this.state.activeOrders.push(newOrder);
        this.state.currentCart = [];
        this.state.editingOrderId = null;
        
        // Start timer after a short delay to show pending state
        setTimeout(() => this.startOrderTimer(newOrder), 2000);
        
        this.persistState();
        return newOrder;
    }

    /**
     * Add current cart items to existing order
     * @param {number} orderId - Order ID
     * @returns {Object|null} Updated order or null if not found
     */
    addToOrder(orderId) {
        const order = this.state.activeOrders.find(o => o.id === orderId);
        if (!order || this.state.currentCart.length === 0) return null;

        // Add cart items to the order
        this.state.currentCart.forEach(cartItem => {
            const existingItem = order.items.find(item => item.name === cartItem.name);
            existingItem 
                ? existingItem.quantity += cartItem.quantity
                : order.items.push({...cartItem});
        });

        // Update order properties
        order.category = this.determineOrderCategory();
        order.total = this.calculateTotal(order.items);
        order.createdAt = Date.now();
        order.status = 'pending';
        
        // Clear cart
        this.state.currentCart = [];
        
        // Restart timer after a short delay to show pending state
        this.clearOrderTimer(orderId);
        setTimeout(() => this.startOrderTimer(order), 2000);
        
        this.persistState();
        return order;
    }

    /**
     * Start editing an existing order
     * @param {number} orderId - Order ID
     * @returns {boolean} Success status
     */
    startEditingOrder(orderId) {
        const order = this.state.activeOrders.find(o => o.id === orderId);
        if (!order) return false;

        // Check if order is in an editable state
        if (order.status !== 'pending' && order.status !== 'preparing') {
            return false;
        }

        // Check editing time limit (3 minutes from creation)
        const timeSinceCreation = Date.now() - order.createdAt;
        if (timeSinceCreation > 180000) { // 3 minutes
            return false;
        }

        this.state.editingOrderId = orderId;
        this.state.currentCart = order.items.map(item => ({...item}));
        
        this.persistState();
        return true;
    }

    /**
     * Update an order being edited
     * @returns {Object|null} Updated order or null
     */
    updateEditingOrder() {
        if (this.state.editingOrderId === null || this.state.currentCart.length === 0) {
            return null;
        }
        
        const order = this.state.activeOrders.find(o => o.id === this.state.editingOrderId);
        if (!order) {
            this.state.editingOrderId = null;
            this.persistState();
            return null;
        }
        
        // Update order with current cart items
        order.items = [...this.state.currentCart];
        order.total = this.calculateTotal(order.items);
        order.createdAt = Date.now();
        order.category = this.determineOrderCategory();
        order.status = 'pending';
        
        // Restart timer after a short delay
        this.clearOrderTimer(order.id);
        setTimeout(() => this.startOrderTimer(order), 2000);
        
        // Clear editing state
        this.state.currentCart = [];
        this.state.editingOrderId = null;
        
        this.persistState();
        return order;
    }

    /**
     * Mark order as picked up
     * @param {number} orderId - Order ID
     * @returns {Object|null} Updated order or null
     */
    completeOrder(orderId) {
        const order = this.state.activeOrders.find(o => o.id === orderId);
        if (!order) return null;

        order.status = 'pickedUp';
        this.clearOrderTimer(orderId);
        
        // Keep picked up orders for 30 minutes before removing completely
        setTimeout(() => {
            this.state.activeOrders = this.state.activeOrders.filter(o => o.id !== orderId);
            this.persistState();
        }, 30 * 60 * 1000);
        
        this.persistState();
        return order;
    }

    /**
     * Format time remaining for order
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Formatted time string
     */
    formatTimeLeft(milliseconds) {
        if (milliseconds <= 0) {
            return this.getCurrentTranslations().readySoon;
        }
        
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        
        return `${minutes}m ${seconds}s`;
    }

    /**
     * Check if currently editing an order
     * @returns {boolean} Editing status
     */
    isEditingOrder() {
        return this.state.editingOrderId !== null;
    }

    /**
     * Get ID of order being edited
     * @returns {number|null} Order ID or null
     */
    getEditingOrderId() {
        return this.state.editingOrderId;
    }
}