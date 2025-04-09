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
  nextOrderId: 1,
  editingOrderId: null
};

const menuData = {}; // Keep your existing menuData structure

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
  ordersContainer: null
};

/* ======================
* CORE FUNCTIONALITY
* ====================== */

function persistState() {
  localStorage.setItem('darsamoState', JSON.stringify({
      activeOrders: state.activeOrders,
      currentCart: state.currentCart,
      nextOrderId: state.nextOrderId,
      editingOrderId: state.editingOrderId
  }));
}

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
  state.editingOrderId = null;
  
  updateUI();
  persistState();
  return newOrder;
}

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
  order.timestamp = new Date().toISOString();
  state.currentCart = [];
  
  updateUI();
  persistState();
}

function startEditingOrder(orderId) {
  const order = state.activeOrders.find(o => o.id === orderId);
  if (!order || order.status !== 'preparing') return;

  state.editingOrderId = orderId;
  state.currentCart = order.items.map(item => ({...item}));
  elements.cartContainer.classList.add('show-cart');
  updateUI();
  persistState();
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/* ======================
* UI UPDATES
* ====================== */

function updateUI() {
  updateCartDisplay();
  updateOrderDisplay();
  updateMenuAvailability();
  
  // Update checkout button based on edit state
  if (state.editingOrderId !== null) {
      elements.checkoutBtn.textContent = 'Update Order';
      elements.checkoutBtn.style.backgroundColor = '#ff9800';
  } else {
      elements.checkoutBtn.textContent = 'Checkout';
      elements.checkoutBtn.style.backgroundColor = '';
  }
}

function updateCartDisplay() {
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

  elements.cartTotalElement.textContent = `${calculateTotal(state.currentCart)} MZN`;
  document.querySelector('.cart-count').textContent = 
      state.currentCart.reduce((sum, item) => sum + item.quantity, 0);

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
                          <div class="order-actions">
                              ${order.status === 'preparing' ? `
                                  <button class="edit-order-btn">Edit</button>
                                  <button class="add-to-order-btn">Add Cart</button>
                              ` : ''}
                          </div>
                      </div>
                  </div>
              `).join('')}
          </div>`;

  document.querySelectorAll('.add-to-order-btn').forEach(btn => {
      btn.addEventListener('click', function() {
          const orderId = parseInt(this.closest('.order').dataset.orderId);
          addToOrder(orderId);
      });
  });

  document.querySelectorAll('.edit-order-btn').forEach(btn => {
      btn.addEventListener('click', function() {
          const orderId = parseInt(this.closest('.order').dataset.orderId);
          startEditingOrder(orderId);
      });
  });
}

function updateMenuAvailability() {
  // Your existing availability logic
}

/* ======================
* EVENT HANDLERS
* ====================== */

function setupEventListeners() {
  elements.darkModeToggle.addEventListener('change', function() {
      document.body.classList.toggle('dark-mode', this.checked);
      localStorage.setItem('darkMode', this.checked);
  });

  elements.categoryBtns.forEach(btn => {
      btn.addEventListener('click', function() {
          const category = this.dataset.category;
          document.querySelector('.menu-section.active-section').classList.remove('active-section');
          document.querySelector('.category-btn.active').classList.remove('active');
          this.classList.add('active');
          document.getElementById(`${category}-section`).classList.add('active-section');
      });
  });

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

  elements.checkoutBtn.addEventListener('click', function() {
      if (state.currentCart.length === 0) {
          alert('Your cart is empty!');
          return;
      }

      if (state.editingOrderId !== null) {
          const order = state.activeOrders.find(o => o.id === state.editingOrderId);
          if (order && order.status === 'preparing') {
              order.items = [...state.currentCart];
              order.total = calculateTotal(order.items);
              order.timestamp = new Date().toISOString();
              state.currentCart = [];
              state.editingOrderId = null;
              alert(`Order #${order.id} updated!`);
              updateUI();
              persistState();
              return;
          }
      }

      if (state.activeOrders.length === 0) {
          createNewOrder();
          alert(`New order #${state.nextOrderId - 1} created!`);
          return;
      }

      const choice = confirm(`Create new order? (OK for new, Cancel to add to existing)`);
      choice ? createNewOrder() : showOrderSelection();
  });

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
  if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      elements.darkModeToggle.checked = true;
  }

  setupEventListeners();
  updateUI();
});