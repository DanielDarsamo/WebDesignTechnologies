/**
 * DARSAMO BITES - Enhanced Order System
 * @module OrderManagement
 * @description Handles multi-order functionality with cart management
 * @version 2.0
 * @author Daniel Darsamo
 */

/* ======================
 * STATE MANAGEMENT
 * ====================== */

/**
 * @typedef {Object} CartItem
 * @property {string} name - Item name
 * @property {number} price - Unit price
 * @property {number} quantity - Item count
 */

/**
 * @typedef {Object} Order
 * @property {number} id - Unique order ID
 * @property {Array<CartItem>} items - Ordered items
 * @property {number} total - Order total
 * @property {string} status - 'preparing' | 'completed'
 * @property {string} timestamp - ISO creation time
 */

// Load saved state or initialize
let state = JSON.parse(localStorage.getItem('darsamoState')) || {
    activeOrders: [],
    currentCart: [],
    nextOrderId: 1
  };
  
  const menuData = { /* ... (keep your existing menuData structure) ... */ };
  
  /* ======================
   * DOM ELEMENTS
   * ====================== */
  const elements = {
    darkModeToggle: document.getElementById('darkModeToggle'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    menuSections: document.querySelectorAll('.menu-section'),
    cartItemsContainer: document.getElementById('cartItems'),
    cartTotalElement: document.getElementById('cartTotal'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    cartToggle: document.querySelector('.cart-toggle'),
    cartContainer: document.querySelector('.cart-container'),
    cartCloseBtn: document.querySelector('.cart-close-btn'),
    addButtons: document.querySelectorAll('.add-btn'),
    ordersContainer: null // Will be initialized
  };
  
  /* ======================
   * CORE FUNCTIONALITY
   * ====================== */
  
  /**
   * Saves current state to localStorage
   */
  function persistState() {
    localStorage.setItem('darsamoState', JSON.stringify({
      activeOrders: state.activeOrders,
      currentCart: state.currentCart,
      nextOrderId: state.nextOrderId
    }));
  }
  
  /**
   * Creates a new order from current cart
   */
  function createNewOrder() {
    const newOrder = {
      id: state.nextOrderId++,
      items: [...state.currentCart],
      total: calculateTotal(state.currentCart),
      status: 'preparing',
      timestamp: new Date().toISOString()
    };
  
    state.activeOrders.push(newOrder);
    state.currentCart = [];
    
    updateUI();
    persistState();
    return newOrder;
  }
  
  /**
   * Adds current cart to existing order
   * @param {number} orderId - Target order ID
   */
  function addToOrder(orderId) {
    const order = state.activeOrders.find(o => o.id === orderId);
    if (!order) return;
  
    state.currentCart.forEach(cartItem => {
      const existingItem = order.items.find(item => item.name === cartItem.name);
      existingItem 
        ? existingItem.quantity += cartItem.quantity
        : order.items.push({...cartItem});
    });
  
    order.total = calculateTotal(order.items);
    order.timestamp = new Date().toISOString(); // Update last modified
    state.currentCart = [];
    
    updateUI();
    persistState();
  }
  
  /**
   * Calculates order total
   * @param {Array<CartItem>} items 
   * @returns {number} Total price
   */
  function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  /* ======================
   * UI UPDATES
   * ====================== */
  
  /**
   * Updates all UI components
   */
  function updateUI() {
    updateCartDisplay();
    updateOrderDisplay();
    updateMenuAvailability();
  }
  
  function updateCartDisplay() {
    // Cart items
    elements.cartItemsContainer.innerHTML = state.currentCart.length === 0
      ? '<p class="empty-cart-message">Your cart is empty</p>'
      : state.currentCart.map(item => `
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
  
    // Cart total
    elements.cartTotalElement.textContent = `${calculateTotal(state.currentCart)} MZN`;
    document.querySelector('.cart-count').textContent = 
      state.currentCart.reduce((sum, item) => sum + item.quantity, 0);
  
    // Quantity button handlers
    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const itemName = this.dataset.name;
        const item = state.currentCart.find(item => item.name === itemName);
        
        if (this.classList.contains('plus')) {
          item.quantity += 1;
        } else {
          item.quantity -= 1;
          if (item.quantity <= 0) {
            state.currentCart = state.currentCart.filter(i => i.name !== itemName);
          }
        }
        
        updateUI();
        persistState();
      });
    });
  }
  
  function updateOrderDisplay() {
    if (!elements.ordersContainer) {
      elements.ordersContainer = document.createElement('div');
      elements.ordersContainer.id = 'ordersContainer';
      document.querySelector('.cart').prepend(elements.ordersContainer);
    }
  
    elements.ordersContainer.innerHTML = state.activeOrders.length === 0
      ? '<p class="empty-orders">No active orders</p>'
      : `
        <h3>Active Orders (${state.activeOrders.length})</h3>
        <div class="order-list">
          ${state.activeOrders.map(order => `
            <div class="order" data-order-id="${order.id}">
              <div class="order-header">
                <h4>Order #${order.id}</h4>
                <span class="order-status ${order.status}">${order.status}</span>
                <span class="order-time">${new Date(order.timestamp).toLocaleTimeString()}</span>
              </div>
              <ul class="order-items">
                ${order.items.slice(0, 3).map(item => `
                  <li>${item.name} × ${item.quantity}</li>
                `).join('')}
                ${order.items.length > 3 ? `<li>+${order.items.length - 3} more</li>` : ''}
              </ul>
              <div class="order-footer">
                <span class="order-total">${order.total} MZN</span>
                <button class="add-to-order-btn">Add Current Cart</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
  
    // Add event listeners to order buttons
    document.querySelectorAll('.add-to-order-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const orderId = parseInt(this.closest('.order').dataset.orderId);
        addToOrder(orderId);
      });
    });
  }
  
  function updateMenuAvailability() {
    // ... (your existing availability logic) ...
  }
  
  /* ======================
   * EVENT HANDLERS
   * ====================== */
  
  function setupEventListeners() {
    // Dark mode toggle
    elements.darkModeToggle.addEventListener('change', function() {
      document.body.classList.toggle('dark-mode', this.checked);
      localStorage.setItem('darkMode', this.checked);
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
        const existingItem = state.currentCart.find(item => item.name === itemName);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.currentCart.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
          });
        }
        
        // Visual feedback
        this.textContent = '✓';
        this.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
          this.textContent = '+';
          this.style.backgroundColor = '';
        }, 1000);
        
        updateUI();
        persistState();
      });
    });
  
    // Checkout flow
    elements.checkoutBtn.addEventListener('click', function() {
      if (state.currentCart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
  
      if (state.activeOrders.length === 0) {
        createNewOrder();
        alert(`New order #${state.nextOrderId - 1} created!`);
        return;
      }
  
      const choice = confirm(`Create new order? (OK for new, Cancel to add to existing)`);
      choice ? createNewOrder() : showOrderSelection();
    });
  
    // Cart toggle
    elements.cartToggle.addEventListener('click', () => {
      elements.cartContainer.classList.add('show-cart');
    });
  
    elements.cartCloseBtn.addEventListener('click', () => {
      elements.cartContainer.classList.remove('show-cart');
    });
  }
  
  function showOrderSelection() {
    const orderId = prompt(
      `Add to which order?\nAvailable: ${state.activeOrders.map(o => `#${o.id}`).join(', ')}`
    );
    
    if (orderId && state.activeOrders.some(o => o.id === parseInt(orderId))) {
      addToOrder(parseInt(orderId));
      alert(`Added to order #${orderId}!`);
    } else {
      alert('Invalid order selection');
    }
  }
  
  /* ======================
   * INITIALIZATION
   * ====================== */
  
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      elements.darkModeToggle.checked = true;
    }
  
    // Setup UI
    setupEventListeners();
    updateUI();
  });