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
            { name: "Pote cake", price: 85, available: true },
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
                    item.style.pointerEvents = 'none';
                } else {
                    // Add click event for available items
                    item.addEventListener('click', () => {
                        addToCart(dataItems[index].name, dataItems[index].price);
                    });
                }
            }
        });
    }
    
    // Category navigation
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding section
            const category = btn.dataset.category;
            menuSections.forEach(section => {
                if (section.id === `${category}-section`) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
    
    // Cart functions
    function addToCart(itemName, itemPrice) {
        // Check if item already in cart
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
    
    function removeFromCart(itemName) {
        const itemIndex = cart.findIndex(item => item.name === itemName);
        
        if (itemIndex !== -1) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }
            
            updateCartDisplay();
        }
    }
    
    function updateCartDisplay() {
        // Clear cart display
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            cartTotalElement.textContent = '0 MZN';
            return;
        }
        
        // Add each item to cart display
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            
            cartItemElement.innerHTML = `
                <span>${item.name} (${item.quantity})</span>
                <div class="cart-item-controls">
                    <span>${item.price * item.quantity} MZN</span>
                    <button class="remove-item" data-name="${item.name}">-</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeFromCart(e.target.dataset.name);
            });
        });
        
        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = `${total} MZN`;
    }
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        alert(`Order placed! Total: ${cartTotalElement.textContent}`);
        cart = [];
        updateCartDisplay();
    });
    
    // Initialize the app
    initializeMenu();
    
    // Simulate some items being out of stock (for demo purposes)
    setTimeout(() => {
        menuData.drinks.coffee[2].available = false; // Coffee & Milk
        menuData.snacks[0].available = false; // Pote cake
        initializeMenu(); // Re-initialize to reflect changes
    }, 3000);
});