document.addEventListener('DOMContentLoaded', function() {
    // Menu data with availability
    const menuData = {
        drinks: {
            coffee: [
                { name: "Espresso", price: 70, available: true },
                { name: "Black coffee", price: 75, available: true },
                { name: "Coffee & Milk", price: 100, available: true },
                { name: "Hot chocolate", price: 100, available: true },
                { name: "Mocachino", price: 100, available: true },
                { name: "Cappuccino", price: 100, available: true },
                { name: "Tea (roibos or english)", price: 60, available: true }
            ],
            coldDrinks: [
                { name: "Cappy (can)", price: 70, available: true },
                { name: "Cappy (bottle)", price: 40, available: true },
                { name: "Ceres juice", price: 50, available: true },
                { name: "Soda (can)", price: 50, available: true },
                { name: "Soda (bottle)", price: 25, available: true },
                { name: "Santal 500ml", price: 75, available: true }
            ],
            teas: [
                { name: "Lemon Tea", price: 60, available: true },
                { name: "Roibos Tea", price: 50, available: true },
                { name: "Ginger Tea", price: 50, available: true },
                { name: "Green Tea", price: 50, available: true },
                { name: "Mint Tea", price: 50, available: true },
                { name: "Indian Tea", price: 50, available: true }
            ]
        },
        snacks: [
            { name: "Pot Cake", price: 85, available: true },
            { name: "Muffin", price: 60, available: true },
            { name: "Coconut cake", price: 85, available: true },
            { name: "Egg sandwich", price: 60, available: true },
            { name: "Ham/Cheese sandwich", price: 70, available: true },
            { name: "Chamusa/Rissol/Coxinha", price: 80, available: true },
            { name: "Chips", price: 60, available: true },
            { name: "Toast chicken or ham&cheese", price: 120, available: true },
            { name: "Beef or Chicken prego", price: 150, available: true },
            { name: "Hamburger cheese & egg", price: 180, available: true },
            { name: "Hamburger with cheese", price: 135, available: true },
            { name: "Hot dog", price: 150, available: true },
            { name: "Wings & chips", price: 200, available: true }
        ]
    };

    // Cart state
    let cart = [];
    
    // DOM Elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const menuSections = document.querySelectorAll('.menu-section');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartToggle = document.querySelector('.cart-toggle');
    const cartContainer = document.querySelector('.cart-container');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const addButtons = document.querySelectorAll('.add-btn');
    
    // Initialize the menu with availability
    function initializeMenu() {
        // For drinks
        const coffeeItems = document.querySelectorAll('#drinks-section .menu-category:nth-child(1) .menu-item');
        const coldDrinksItems = document.querySelectorAll('#drinks-section .menu-category:nth-child(2) .menu-item');
        const teasItems = document.querySelectorAll('#drinks-section .menu-category:nth-child(3) .menu-item');
        
        // For snacks
        const snacksItems = document.querySelectorAll('#snacks-section .menu-category .menu-item');
        
        // Update availability based on menuData
        updateAvailability(coffeeItems, menuData.drinks.coffee);
        updateAvailability(coldDrinksItems, menuData.drinks.coldDrinks);
        updateAvailability(teasItems, menuData.drinks.teas);
        updateAvailability(snacksItems, menuData.snacks);
    }
    
    function updateAvailability(domItems, dataItems) {
        domItems.forEach((item, index) => {
            if (index < dataItems.length) {
                if (!dataItems[index].available) {
                    item.classList.add('out-of-stock');
                    const addBtn = item.querySelector('.add-btn');
                    if (addBtn) {
                        addBtn.disabled = true;
                        addBtn.textContent = '✕';
                        addBtn.style.backgroundColor = '#ccc';
                        addBtn.style.cursor = 'not-allowed';
                    }
                }
            }
        });
    }
    
    // Initialize dark mode from localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    // Dark mode toggle functionality
    darkModeToggle.addEventListener('change', function() {
        const isDarkMode = this.checked;
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode);
    });
    
    // Cart toggle functionality
    cartToggle.addEventListener('click', () => {
        cartContainer.classList.add('show-cart');
    });
    
    cartCloseBtn.addEventListener('click', () => {
        cartContainer.classList.remove('show-cart');
    });
    
    // Add to cart functionality
    addButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            const itemName = this.dataset.name;
            const itemPrice = parseInt(this.dataset.price);
            addToCart(itemName, itemPrice);
            
            // Visual feedback
            this.textContent = '✓';
            this.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                this.textContent = '+';
                this.style.backgroundColor = '';
            }, 1000);
        });
    });
    
    // Category navigation with animation
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Get the target section
            const category = this.dataset.category;
            const targetSection = document.getElementById(`${category}-section`);
            
            // Get current active section and button
            const currentActiveSection = document.querySelector('.menu-section.active-section');
            const currentActiveBtn = document.querySelector('.category-btn.active');
            
            // Remove active classes with animation
            currentActiveSection.classList.remove('active-section');
            currentActiveBtn.classList.remove('active');
            
            // Add active classes to new selection
            this.classList.add('active');
            targetSection.classList.add('active-section');
        });
    });
    
    // Cart functions
    function addToCart(itemName, itemPrice) {
        const existingItem = cart.find(item => item.name === itemName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: itemName,
                price: itemPrice,
                quantity: 1
            });
        }
        
        updateCartDisplay();
    }
    
    function updateCartDisplay() {
        // Clear cart display
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            cartTotalElement.textContent = '0 MZN';
            document.querySelector('.cart-count').textContent = '0';
            return;
        }
        
        // Add each item to cart display
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            
            cartItemElement.innerHTML = `
                <span class="cart-item-name">${item.name}</span>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-name="${item.name}">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-name="${item.name}">+</button>
                    <span class="cart-item-price">${item.price * item.quantity} MZN</span>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemName = this.dataset.name;
                const item = cart.find(item => item.name === itemName);
                
                if (this.classList.contains('plus')) {
                    item.quantity += 1;
                } else if (this.classList.contains('minus')) {
                    item.quantity -= 1;
                    if (item.quantity <= 0) {
                        cart = cart.filter(i => i.name !== itemName);
                    }
                }
                
                updateCartDisplay();
            });
        });
        
        // Update total and cart count
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartTotalElement.textContent = `${total} MZN`;
        document.querySelector('.cart-count').textContent = totalItems;
    }
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        alert(`Order placed! Total: ${cartTotalElement.textContent}\nThank you for your order!`);
        cart = [];
        updateCartDisplay();
        cartContainer.classList.remove('show-cart');
    });
    
    // Initialize the menu
    initializeMenu();
});