/**
 * DARSAMO BITES - Enhanced Order System v2.1.2
 * @module OrderManagement
 * @description Handles multi-order functionality with real-time tracking
 * @author Daniel Darsamo
 */

/* ======================
 * STATE MANAGEMENT
 * ====================== */

const STATE_VERSION = '2.1.2';
const translations = {
    en: {
        cartTitle: "Your Order",
        total: "Total:",
        checkout: "Checkout",
        updateOrder: "Update Order",
        emptyCart: "Your cart is empty",
        orderReady: "Your order is ready!",
        pickupMessage: "Please proceed to pickup counter",
        editExpired: "Editing time expired (3 minutes limit)",
        activeOrders: "Active Orders",
        statusPending: "Pending",
        statusPreparing: "Preparing",
        statusReady: "Ready",
        statusPickedUp: "Picked Up",
        orderCreated: "Order #{id} created successfully!",
        itemsAdded: "Items added to Order #{id}!",
        editingOrder: "Editing Order #{id}...",
        orderUpdated: "Order #{id} updated successfully!",
        noActiveOrders: "No active orders",
        moreItems: "more items",
        addedToCart: "added to cart",
        emptyCartWarning: "Your cart is empty!",
        createNewOrderPrompt: "Create new order? (OK for new, Cancel to add to existing)",
        confirmPickup: "Confirm Pickup",
        project: "Project by Daniel Darsamo",
        order: "Order"
    },
    pt: {
        cartTitle: "Seu Pedido",
        total: "Total:",
        checkout: "Finalizar",
        updateOrder: "Atualizar Pedido",
        emptyCart: "Seu carrinho está vazio",
        orderReady: "Seu pedido está pronto!",
        pickupMessage: "Por favor, vá ao balcão de retirada",
        editExpired: "Tempo de edição expirado (limite de 3 minutos)",
        activeOrders: "Pedidos Ativos",
        statusPending: "Pendente",
        statusPreparing: "Preparando",
        statusReady: "Pronto",
        statusPickedUp: "Retirado",
        orderCreated: "Pedido #{id} criado com sucesso!",
        itemsAdded: "Itens adicionados ao Pedido #{id}!",
        editingOrder: "Editando Pedido #{id}...",
        orderUpdated: "Pedido #{id} atualizado com sucesso!",
        noActiveOrders: "Nenhum pedido ativo",
        moreItems: "mais itens",
        addedToCart: "adicionado ao carrinho",
        emptyCartWarning: "Seu carrinho está vazio!",
        createNewOrderPrompt: "Criar novo pedido? (OK para novo, Cancelar para adicionar ao existente)",
        confirmPickup: "Confirmar Retirada",
        project: "Projeto de Daniel Darsamo",
        order: "Pedido"
    }
};

let state = {
    activeOrders: [],
    currentCart: [],
    nextOrderId: 1,
    editingOrderId: null,
    currentLanguage: 'en',
    orderTimers: {}
};

/* ======================
 * DOM ELEMENTS
 * ====================== */

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
    ordersContainer: null,
    modalTitle: document.getElementById('modalTitle'),
    modalItems: document.getElementById('modalItems'),
    modalTotal: document.getElementById('modalTotal'),
    confirmPickupBtn: document.querySelector('.confirm-pickup'),
    orderCompletionModal: document.querySelector('.order-completion-modal')
};

/* ======================
 * CORE FUNCTIONALITY
 * ====================== */

function persistState() {
    localStorage.setItem('darsamoState', JSON.stringify({
        activeOrders: state.activeOrders,
        currentCart: state.currentCart,
        nextOrderId: state.nextOrderId,
        editingOrderId: state.editingOrderId,
        currentLanguage: state.currentLanguage
    }));
}

function determineOrderCategory() {
    const categories = new Set();
    state.currentCart.forEach(item => {
        const section = document.querySelector(`[data-name="${item.name}"]`)
                       .closest('.menu-section');
        categories.add(section.dataset.category);
    });
    return categories.size > 1 ? 'mixed' : categories.values().next().value || 'drinks';
}

function calculatePreparationTime(category) {
    const times = {
        'drinks': 5 * 60 * 1000,    // 5 minutes
        'snacks': 5 * 60 * 1000,    // 5 minutes
        'mixed': 20 * 60 * 1000     // 20 minutes
    };
    return times[category] || 5 * 60 * 1000;
}

function startOrderTimer(order) {
    clearInterval(state.orderTimers[order.id]);
    const preparationTime = calculatePreparationTime(order.category);
    order.estimatedReady = Date.now() + preparationTime;
    order.status = 'preparing';
    
    state.orderTimers[order.id] = setInterval(() => {
        const timeLeft = order.estimatedReady - Date.now();
        
        if (timeLeft <= 0) {
            order.status = 'ready';
            showCompletionModal(order);
            clearInterval(state.orderTimers[order.id]);
            updateUI();
        }
    }, 1000);
}

function createNewOrder() {
    const newOrder = {
        id: state.nextOrderId++,
        items: [...state.currentCart],
        total: calculateTotal(state.currentCart),
        status: 'pending',
        createdAt: Date.now(),
        estimatedReady: null,
        category: determineOrderCategory()
    };

    state.activeOrders.push(newOrder);
    state.currentCart = [];
    state.editingOrderId = null;
    
    showNotification(
        translations[state.currentLanguage].orderCreated.replace('{id}', newOrder.id), 
        'success'
    );
    
    setTimeout(() => startOrderTimer(newOrder), 1000);
    
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

    order.category = determineOrderCategory();
    order.total = calculateTotal(order.items);
    order.createdAt = Date.now();
    state.currentCart = [];
    
    clearInterval(state.orderTimers[orderId]);
    startOrderTimer(order);
    
    showNotification(
        translations[state.currentLanguage].itemsAdded.replace('{id}', orderId), 
        'success'
    );
    updateUI();
    persistState();
}

function startEditingOrder(orderId) {
    const originalOrder = state.activeOrders.find(o => o.id === orderId);
    if (!originalOrder) return;

    const timeSinceCreation = Date.now() - originalOrder.createdAt;
    if (timeSinceCreation > 180000) {
        showNotification(translations[state.currentLanguage].editExpired, 'error');
        return;
    }

    state.editingOrderId = orderId;
    state.currentCart = originalOrder.items.map(item => ({...item}));
    elements.cartContainer.classList.add('show-cart');
    showNotification(
        translations[state.currentLanguage].editingOrder.replace('{id}', orderId), 
        'info'
    );
    updateUI();
    persistState();
}

function completeOrder(orderId) {
    const order = state.activeOrders.find(o => o.id === orderId);
    if (!order) return;

    order.status = 'pickedUp';
    clearInterval(state.orderTimers[orderId]);
    delete state.orderTimers[orderId];
    
    setTimeout(() => {
        state.activeOrders = state.activeOrders.filter(o => o.id !== orderId);
        updateUI();
        persistState();
    }, 300000);
    
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
    updateActiveOrdersBadge();
    applyTranslations();
    
    if (state.editingOrderId !== null) {
        elements.checkoutBtn.textContent = translations[state.currentLanguage].updateOrder;
        elements.checkoutBtn.style.backgroundColor = '#ff9800';
    } else {
        elements.checkoutBtn.textContent = translations[state.currentLanguage].checkout;
        elements.checkoutBtn.style.backgroundColor = '';
    }
}

function updateActiveOrdersBadge() {
    const activeCount = state.activeOrders.filter(o => o.status !== 'pickedUp').length;
    elements.activeOrdersToggle.style.display = activeCount > 0 ? 'flex' : 'none';
    document.querySelector('.orders-count').textContent = activeCount;
}

function updateCartDisplay() {
    elements.cartItemsContainer.innerHTML = state.currentCart.length === 0
        ? `<p class="empty-cart-message">${translations[state.currentLanguage].emptyCart}</p>`
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

    const activeOrders = state.activeOrders.filter(o => o.status !== 'pickedUp');
    
    elements.ordersContainer.innerHTML = activeOrders.length === 0
        ? `<p class="empty-orders">${translations[state.currentLanguage].noActiveOrders}</p>`
        : `
            <h3>${translations[state.currentLanguage].activeOrders} (${activeOrders.length})</h3>
            <div class="order-list">
                ${activeOrders.map(order => `
                    <div class="order" data-order-id="${order.id}">
                        <div class="order-header">
                            <h4>${translations[state.currentLanguage].orderCreated.split(' ')[0]} #${order.id}</h4>
                            <span class="order-status ${order.status}">
                                ${translations[state.currentLanguage][`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`]}
                            </span>
                            <span class="order-time">
                                ${formatTimeLeft(order.estimatedReady - Date.now())}
                            </span>
                        </div>
                        <ul class="order-items">
                            ${order.items.slice(0, 3).map(item => `
                                <li>${item.name} × ${item.quantity}</li>
                            `).join('')}
                            ${order.items.length > 3 ? `<li>+${order.items.length - 3} ${translations[state.currentLanguage].moreItems}</li>` : ''}
                        </ul>
                        <div class="order-footer">
                            <span class="order-total">${order.total} MZN</span>
                            <div class="order-actions">
                                ${order.status === 'pending' || order.status === 'preparing' ? `
                                    <button class="edit-order-btn">${translations[state.currentLanguage].edit}</button>
                                    <button class="add-to-order-btn">${translations[state.currentLanguage].addItems}</button>
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

function formatTimeLeft(ms) {
    if (ms <= 0) return translations[state.currentLanguage].readySoon;
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
}

function applyTranslations() {
    elements.cartItemsContainer.querySelector('.empty-cart-message')?.textContent = 
        translations[state.currentLanguage].emptyCart;
    elements.cartTotalElement.previousElementSibling.textContent = 
        translations[state.currentLanguage].total;
    document.querySelector('.cart h2').textContent = 
        translations[state.currentLanguage].cartTitle;
}

/* ======================
 * ORDER COMPLETION MODAL
 * ====================== */

function showCompletionModal(order) {
    elements.modalTitle.textContent = translations[state.currentLanguage].orderReady;
    elements.modalItems.innerHTML = order.items.map(item => `
        <div class="modal-item">
            <span>${item.name}</span>
            <span>× ${item.quantity}</span>
            <span>${item.price * item.quantity} MZN</span>
        </div>
    `).join('');
    elements.modalTotal.textContent = `${translations[state.currentLanguage].total}: ${order.total} MZN`;
    elements.orderCompletionModal.style.display = 'block';
}

function closeCompletionModal() {
    elements.orderCompletionModal.style.display = 'none';
}

/* ======================
 * ACTIVE ORDERS PANEL
 * ====================== */

function showActiveOrdersPanel() {
    const activeOrders = state.activeOrders.filter(o => o.status !== 'pickedUp');
    
    if (activeOrders.length === 0) {
        showNotification(translations[state.currentLanguage].noActiveOrders, 'info');
        return;
    }
    
    let panel = document.querySelector('.active-orders-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.className = 'active-orders-panel';
        document.body.appendChild(panel);
    }
    
    panel.innerHTML = `
        <div class="panel-header">
            <h3>${translations[state.currentLanguage].activeOrders} (${activeOrders.length})</h3>
            <button class="close-panel">×</button>
        </div>
        <div class="panel-content">
            ${activeOrders.map(order => `
                <div class="panel-order" data-order-id="${order.id}">
                    <div class="panel-order-header">
                        <h4>#${order.id}</h4>
                        <span class="order-status ${order.status}">
                            ${translations[state.currentLanguage][`status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`]}
                        </span>
                    </div>
                    <div class="panel-order-time">
                        ${formatTimeLeft(order.estimatedReady - Date.now())}
                    </div>
                    <div class="panel-order-actions">
                        <button class="panel-edit-btn">${translations[state.currentLanguage].edit}</button>
                        <button class="panel-add-btn">${translations[state.currentLanguage].addItems}</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    panel.style.display = 'block';
    
    panel.querySelector('.close-panel').addEventListener('click', () => {
        panel.style.display = 'none';
    });
    
    panel.querySelectorAll('.panel-edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.closest('.panel-order').dataset.orderId);
            startEditingOrder(orderId);
            panel.style.display = 'none';
        });
    });
    
    panel.querySelectorAll('.panel-add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.closest('.panel-order').dataset.orderId);
            addToOrder(orderId);
            panel.style.display = 'none';
        });
    });
}

/* ======================
 * NOTIFICATION SYSTEM
 * ====================== */

function showNotification(message, type = 'success') {
    const container = document.querySelector('.notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    setTimeout(() => notification.classList.add('active'), 50);
    
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* ======================
 * EVENT HANDLERS
 * ====================== */

function setupEventListeners() {
    elements.darkModeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
        localStorage.setItem('darkMode', this.checked);
    });

    elements.languageToggle.addEventListener('change', function() {
        state.currentLanguage = this.checked ? 'pt' : 'en';
        const slider = this.closest('.language-switch');
        slider.querySelector('.left').textContent = state.currentLanguage === 'en' ? 'EN' : 'PT';
        slider.querySelector('.right').textContent = state.currentLanguage === 'en' ? 'PT' : 'EN';
        applyTranslations();
        updateUI();
        persistState();
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
            
            showNotification(`${itemName} ${translations[state.currentLanguage].addedToCart}`, 'success');
            updateUI();
            persistState();
        });
    });

    elements.checkoutBtn.addEventListener('click', function() {
        if (state.currentCart.length === 0) {
            showNotification(translations[state.currentLanguage].emptyCartWarning, 'error');
            return;
        }

        if (state.editingOrderId !== null) {
            const order = state.activeOrders.find(o => o.id === state.editingOrderId);
            if (order && (order.status === 'pending' || order.status === 'preparing')) {
                order.items = [...state.currentCart];
                order.total = calculateTotal(order.items);
                order.createdAt = Date.now();
                order.category = determineOrderCategory();
                
                clearInterval(state.orderTimers[order.id]);
                startOrderTimer(order);
                
                state.currentCart = [];
                state.editingOrderId = null;
                showNotification(
                    translations[state.currentLanguage].orderUpdated.replace('{id}', order.id), 
                    'success'
                );
                updateUI();
                persistState();
                return;
            }
        }

        if (state.activeOrders.length === 0) {
            createNewOrder();
            return;
        }

        const choice = confirm(translations[state.currentLanguage].createNewOrderPrompt);
        if (choice) {
            createNewOrder();
        } else {
            showActiveOrdersPanel();
        }
    });

    elements.cartToggle.addEventListener('click', () => {
        elements.cartContainer.classList.add('show-cart');
    });

    elements.activeOrdersToggle.addEventListener('click', showActiveOrdersPanel);

    elements.cartCloseBtn.addEventListener('click', () => {
        elements.cartContainer.classList.remove('show-cart');
    });

    elements.confirmPickupBtn.addEventListener('click', () => {
        const readyOrder = state.activeOrders.find(o => o.status === 'ready');
        if (readyOrder) {
            completeOrder(readyOrder.id);
        }
        closeCompletionModal();
    });

    elements.orderCompletionModal.addEventListener('click', (e) => {
        if (e.target === elements.orderCompletionModal) {
            closeCompletionModal();
        }
    });
}

/* ======================
 * INITIALIZATION
 * ====================== */

document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        elements.darkModeToggle.checked = true;
    }

    if (localStorage.getItem('darsamoState')) {
        const savedState = JSON.parse(localStorage.getItem('darsamoState'));
        state = {
            ...state,
            ...savedState,
            currentLanguage: savedState.currentLanguage || 'en'
        };
    }
    
    document.querySelector('.language-label.left').textContent = state.currentLanguage === 'en' ? 'EN' : 'PT';
    document.querySelector('.language-label.right').textContent = state.currentLanguage === 'en' ? 'PT' : 'EN';

    state.activeOrders.forEach(order => {
        if (order.status === 'preparing' && order.estimatedReady > Date.now()) {
            startOrderTimer(order);
        }
    });

    setupEventListeners();
    updateUI();
    applyTranslations();
});