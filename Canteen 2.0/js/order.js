/**
 * Order Controller - Handles order creation and tracking
 */
const OrderController = (function() {
    // Current active order
    let activeOrder = null;
    
    // Order timer for status updates
    let orderTimer = null;
    
    // Generate order ID
    const generateOrderId = function() {
        return Math.floor(1000 + Math.random() * 9000);
    };
    
    // Calculate preparation time based on items
    const calculatePrepTime = function(items) {
        // Base time 5 minutes
        let baseTime = 5 * 60 * 1000;
        
        // Add time for each item
        let additionalTime = items.reduce((total, item) => {
            const menuItem = findMenuItem(item.id);
            return total + (menuItem ? menuItem.prepTime * 60 * 1000 * item.quantity : 0);
        }, 0);
        
        // For demo, make it shorter
        // In real app, would use actual values
        return (baseTime + additionalTime) / 60; // Divide by 60 for demo
    };
    
    // Find item in menu data
    const findMenuItem = function(id) {
        for (const category in menuData) {
            const item = menuData[category].find(item => item.id === id);
            if (item) return item;
        }
        return null;
    };
    
    // Save active order to local storage
    const saveOrderToStorage = function() {
        localStorage.setItem('darsamoActiveOrder', JSON.stringify(activeOrder));
    };
    
    // Load active order from local storage
    const loadOrderFromStorage = function() {
        const storedOrder = localStorage.getItem('darsamoActiveOrder');
        if (storedOrder) {
            activeOrder = JSON.parse(storedOrder);
            
            // Check if order is still active based on timestamp
            if (activeOrder && new Date(activeOrder.estimatedReadyTime) < new Date()) {
                // If estimated ready time has passed, set to ready
                if (activeOrder.status !== 'ready') {
                    activeOrder.status = 'ready';
                    saveOrderToStorage();
                }
            }
        }
    };
    
    // Start order status updates
    const startOrderUpdates = function() {
        // Clear any existing timer
        if (orderTimer) {
            clearInterval(orderTimer);
        }
        
        // Update order status based on time
        orderTimer = setInterval(() => {
            if (!activeOrder) return;
            
            const now = new Date();
            const orderTime = new Date(activeOrder.createdAt);
            const prepTime = calculatePrepTime(activeOrder.items);
            const halfPrepTime = prepTime / 2;
            
            // Calculate elapsed time in milliseconds
            const elapsedTime = now - orderTime;
            
            if (activeOrder.status === 'pending' && elapsedTime >= halfPrepTime) {
                // Update to preparing after half prep time
                activeOrder.status = 'preparing';
                saveOrderToStorage();
                UIController.updateActiveOrderUI(activeOrder);
            } else if (activeOrder.status === 'preparing' && now >= new Date(activeOrder.estimatedReadyTime)) {
                // Update to ready when estimated time is reached
                activeOrder.status = 'ready';
                saveOrderToStorage();
                UIController.updateActiveOrderUI(activeOrder);
            }
        }, 1000);
    };
    
    // Public methods
    return {
        // Initialize order system
        init: function() {
            loadOrderFromStorage();
            if (activeOrder) {
                UIController.updateActiveOrderUI(activeOrder);
                startOrderUpdates();
            }
        },
        
        // Get active order
        getActiveOrder: function() {
            return activeOrder;
        },
        
        // Create new order from cart
        createOrder: function(cart) {
            if (cart.length === 0) return null;
            
            const now = new Date();
            const prepTime = calculatePrepTime(cart);
            const estimatedReadyTime = new Date(now.getTime() + prepTime);
            
            activeOrder = {
                id: generateOrderId(),
                items: [...cart],
                total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
                status: 'pending',
                createdAt: now.toISOString(),
                estimatedReadyTime: estimatedReadyTime.toISOString(),
                notified: false
            };
            
            // Save order and start updates
            saveOrderToStorage();
            startOrderUpdates();
            UIController.updateActiveOrderUI(activeOrder);
            
            return activeOrder;
        },
        
        // Update order status
        updateOrderStatus: function(status) {
            if (!activeOrder) return false;
            
            activeOrder.status = status;
            saveOrderToStorage();
            UIController.updateActiveOrderUI(activeOrder);
            
            return true;
        },
        
        // Complete and clear active order
        completeOrder: function() {
            if (!activeOrder) return false;
            
            // Clear active order
            const completedOrder = {...activeOrder};
            activeOrder = null;
            localStorage.removeItem('darsamoActiveOrder');
            
            // Clear timer
            if (orderTimer) {
                clearInterval(orderTimer);
                orderTimer = null;
            }
            
            UIController.updateActiveOrderUI(null);
            
            return completedOrder;
        },
        
        // Check if there is an active order
        hasActiveOrder: function() {
            return activeOrder !== null;
        }
    };
})();