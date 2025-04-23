/**
 * Cart Controller - Handles all cart operations
 */
const CartController = (function() {
    // Cart data
    let cart = [];
    
    // Find item in cart
    const findCartItem = function(id) {
        return cart.find(item => item.id === id);
    };
    
    // Find item in menu data
    const findMenuItem = function(id) {
        for (const category in menuData) {
            const item = menuData[category].find(item => item.id === id);
            if (item) return item;
        }
        return null;
    };
    
    // Save cart to local storage
    const saveCartToStorage = function() {
        localStorage.setItem('darsamoCart', JSON.stringify(cart));
    };
    
    // Load cart from local storage
    const loadCartFromStorage = function() {
        const storedCart = localStorage.getItem('darsamoCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    };
    
    // Public methods
    return {
        // Initialize cart
        init: function() {
            loadCartFromStorage();
            UIController.updateCartUI(cart);
        },
        
        // Get cart
        getCart: function() {
            return [...cart];
        },
        
        // Add item to cart
        addToCart: function(itemId, quantity = 1) {
            const menuItem = findMenuItem(itemId);
            if (!menuItem) return false;
            
            // Check if item already exists in cart
            const existingItem = findCartItem(itemId);
            
            if (existingItem) {
                // Update quantity
                existingItem.quantity += quantity;
            } else {
                // Add new item
                cart.push({
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    image: menuItem.image,
                    quantity: quantity
                });
            }
            
            // Update UI and save
            UIController.updateCartUI(cart);
            saveCartToStorage();
            
            return true;
        },
        
        // Remove item from cart
        removeFromCart: function(itemId) {
            cart = cart.filter(item => item.id !== itemId);
            
            // Update UI and save
            UIController.updateCartUI(cart);
            saveCartToStorage();
            
            return true;
        },
        
        // Increase item quantity
        increaseItemQuantity: function(itemId) {
            const item = findCartItem(itemId);
            if (item) {
                item.quantity += 1;
                
                // Update UI and save
                UIController.updateCartUI(cart);
                saveCartToStorage();
                
                return true;
            }
            return false;
        },
        
        // Decrease item quantity
        decreaseItemQuantity: function(itemId) {
            const item = findCartItem(itemId);
            if (item) {
                item.quantity -= 1;
                
                // Remove item if quantity is 0
                if (item.quantity <= 0) {
                    return this.removeFromCart(itemId);
                }
                
                // Update UI and save
                UIController.updateCartUI(cart);
                saveCartToStorage();
                
                return true;
            }
            return false;
        },
        
        // Clear cart
        clearCart: function() {
            cart = [];
            
            // Update UI and save
            UIController.updateCartUI(cart);
            saveCartToStorage();
            
            return true;
        },
        
        // Calculate cart total
        getCartTotal: function() {
            return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        
        // Get cart item count
        getCartItemCount: function() {
            return cart.reduce((total, item) => total + item.quantity, 0);
        },
        
        // Check if cart is empty
        isCartEmpty: function() {
            return cart.length === 0;
        }
    };
})();