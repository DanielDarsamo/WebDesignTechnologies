/**
 * Menu data and ingredients information
 */
const menuData = {
    coffee: [
        {
            id: 1,
            name: "Espresso",
            description: "Rich, full-bodied shot",
            price: 3.50,
            image: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg",
            calories: 5,
            prepTime: 2,
            ingredients: [
                { name: "Coffee beans", icon: "☕" },
                { name: "Water", icon: "💧" }
            ],
            longDescription: "Our espresso is made with premium arabica beans, carefully roasted to perfection. Each shot is pulled with precision to create a rich and flavorful experience with a beautiful crema."
        },
        {
            id: 2,
            name: "Cappuccino",
            description: "Espresso with steamed milk foam",
            price: 4.25,
            image: "https://images.pexels.com/photos/350478/pexels-photo-350478.jpeg",
            calories: 120,
            prepTime: 4,
            ingredients: [
                { name: "Espresso", icon: "☕" },
                { name: "Steamed milk", icon: "🥛" },
                { name: "Milk foam", icon: "☁️" }
            ],
            longDescription: "Our cappuccino combines a shot of espresso with equal parts steamed milk and milk foam, creating a perfect balance of rich coffee flavor and creamy texture."
        },
        {
            id: 3,
            name: "Latte",
            description: "Espresso with steamed milk",
            price: 4.50,
            image: "https://images.pexels.com/photos/3020323/pexels-photo-3020323.jpeg",
            calories: 190,
            prepTime: 4,
            ingredients: [
                { name: "Espresso", icon: "☕" },
                { name: "Steamed milk", icon: "🥛" },
                { name: "Milk foam", icon: "☁️" }
            ],
            longDescription: "Our latte combines a shot of espresso with steamed milk and a light layer of foam on top, creating a smooth and creamy coffee experience."
        },
        {
            id: 4,
            name: "Mocha",
            description: "Espresso with chocolate and milk",
            price: 4.75,
            image: "https://images.pexels.com/photos/434213/pexels-photo-434213.jpeg",
            calories: 250,
            prepTime: 5,
            ingredients: [
                { name: "Espresso", icon: "☕" },
                { name: "Chocolate", icon: "🍫" },
                { name: "Steamed milk", icon: "🥛" },
                { name: "Whipped cream", icon: "🍦" }
            ],
            longDescription: "Our mocha blends rich espresso with chocolate syrup and steamed milk, topped with a dollop of whipped cream for a decadent treat."
        }
    ],
    tea: [
        {
            id: 5,
            name: "Herbal Tea",
            description: "Soothing herbal blend",
            price: 3.25,
            image: "https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg",
            calories: 0,
            prepTime: 3,
            ingredients: [
                { name: "Herbal blend", icon: "🌿" },
                { name: "Hot water", icon: "💧" }
            ],
            longDescription: "Our herbal tea is a caffeine-free blend of herbs, flowers, and spices, offering a soothing and aromatic experience. Perfect for relaxation."
        },
        {
            id: 6,
            name: "Chai",
            description: "Spiced tea with milk",
            price: 4.00,
            image: "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg",
            calories: 150,
            prepTime: 5,
            ingredients: [
                { name: "Black tea", icon: "🍵" },
                { name: "Spices", icon: "🌱" },
                { name: "Steamed milk", icon: "🥛" }
            ],
            longDescription: "Our chai is a warming blend of black tea and aromatic spices like cinnamon, cardamom, ginger, and cloves, mixed with steamed milk for a comforting drink."
        },
        {
            id: 7,
            name: "Matcha",
            description: "Green tea powder with milk",
            price: 4.50,
            image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg",
            calories: 130,
            prepTime: 4,
            ingredients: [
                { name: "Matcha powder", icon: "🍵" },
                { name: "Hot water", icon: "💧" },
                { name: "Steamed milk", icon: "🥛" }
            ],
            longDescription: "Our matcha latte is made with premium Japanese green tea powder, whisked to perfection with hot water and topped with steamed milk for a smooth and energizing drink."
        }
    ],
    pastries: [
        {
            id: 8,
            name: "Croissant",
            description: "Buttery, flaky pastry",
            price: 3.25,
            image: "https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg",
            calories: 320,
            prepTime: 0,
            ingredients: [
                { name: "Butter", icon: "🧈" },
                { name: "Flour", icon: "🌾" },
                { name: "Sugar", icon: "🍬" },
                { name: "Salt", icon: "🧂" }
            ],
            longDescription: "Our croissants are made fresh daily with premium European butter, creating a flaky, buttery pastry with hundreds of delicate layers."
        },
        {
            id: 9,
            name: "Muffin",
            description: "Blueberry or chocolate chip",
            price: 3.50,
            image: "https://images.pexels.com/photos/3650438/pexels-photo-3650438.jpeg",
            calories: 420,
            prepTime: 0,
            ingredients: [
                { name: "Flour", icon: "🌾" },
                { name: "Sugar", icon: "🍬" },
                { name: "Butter", icon: "🧈" },
                { name: "Eggs", icon: "🥚" },
                { name: "Blueberries/Chocolate", icon: "🫐" }
            ],
            longDescription: "Our muffins are baked fresh every morning with your choice of juicy blueberries or rich chocolate chips, creating a moist and delicious treat."
        },
        {
            id: 10,
            name: "Cinnamon Roll",
            description: "Sweet roll with cinnamon and icing",
            price: 4.00,
            image: "https://images.pexels.com/photos/267308/pexels-photo-267308.jpeg",
            calories: 510,
            prepTime: 0,
            ingredients: [
                { name: "Flour", icon: "🌾" },
                { name: "Sugar", icon: "🍬" },
                { name: "Butter", icon: "🧈" },
                { name: "Cinnamon", icon: "🌰" },
                { name: "Cream cheese icing", icon: "🍦" }
            ],
            longDescription: "Our cinnamon rolls feature soft, pillowy dough wrapped around a buttery cinnamon-sugar filling, topped with cream cheese icing that melts into every swirl."
        }
    ],
    desserts: [
        {
            id: 11,
            name: "Cheesecake",
            description: "Creamy classic cheesecake",
            price: 5.50,
            image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg",
            calories: 450,
            prepTime: 0,
            ingredients: [
                { name: "Cream cheese", icon: "🧀" },
                { name: "Sugar", icon: "🍬" },
                { name: "Eggs", icon: "🥚" },
                { name: "Graham cracker crust", icon: "🥠" }
            ],
            longDescription: "Our classic cheesecake is rich and creamy with a buttery graham cracker crust, baked to perfection for a smooth texture and satisfying dessert experience."
        },
        {
            id: 12,
            name: "Tiramisu",
            description: "Coffee-flavored Italian dessert",
            price: 5.75,
            image: "https://images.pexels.com/photos/6341164/pexels-photo-6341164.jpeg",
            calories: 380,
            prepTime: 0,
            ingredients: [
                { name: "Ladyfingers", icon: "🍪" },
                { name: "Espresso", icon: "☕" },
                { name: "Mascarpone", icon: "🍦" },
                { name: "Cocoa powder", icon: "🍫" }
            ],
            longDescription: "Our tiramisu is made with espresso-soaked ladyfingers layered with a creamy mascarpone mixture and dusted with cocoa powder for an authentic Italian dessert experience."
        },
        {
            id: 13,
            name: "Macarons",
            description: "Assorted French cookies",
            price: 2.50,
            image: "https://images.pexels.com/photos/239581/pexels-photo-239581.jpeg",
            calories: 90,
            prepTime: 0,
            ingredients: [
                { name: "Almond flour", icon: "🌰" },
                { name: "Egg whites", icon: "🥚" },
                { name: "Sugar", icon: "🍬" },
                { name: "Food coloring", icon: "🎨" }
            ],
            longDescription: "Our macarons feature a crisp exterior and chewy interior with a variety of flavored fillings between two delicate almond meringue cookies. Available in assorted flavors and colors."
        }
    ],
    cold: [
        {
            id: 14,
            name: "Iced Coffee",
            description: "Cold brewed coffee over ice",
            price: 4.00,
            image: "https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg",
            calories: 15,
            prepTime: 2,
            ingredients: [
                { name: "Cold brew coffee", icon: "☕" },
                { name: "Ice", icon: "🧊" },
                { name: "Milk (optional)", icon: "🥛" }
            ],
            longDescription: "Our iced coffee is made with cold brew steeped for 24 hours for a smooth, rich flavor without bitterness, served over ice with optional milk and sweetener."
        },
        {
            id: 15,
            name: "Lemonade",
            description: "Fresh-squeezed with mint",
            price: 3.75,
            image: "https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg",
            calories: 120,
            prepTime: 3,
            ingredients: [
                { name: "Lemon juice", icon: "🍋" },
                { name: "Sugar", icon: "🍬" },
                { name: "Water", icon: "💧" },
                { name: "Fresh mint", icon: "🌿" }
            ],
            longDescription: "Our refreshing lemonade is made fresh daily with hand-squeezed lemons, pure cane sugar, and a hint of fresh mint. Perfectly balanced between sweet and tart."
        },
        {
            id: 16,
            name: "Smoothie",
            description: "Mixed berry or tropical",
            price: 5.25,
            image: "https://images.pexels.com/photos/6045219/pexels-photo-6045219.jpeg",
            calories: 230,
            prepTime: 4,
            ingredients: [
                { name: "Fresh fruits", icon: "🍓" },
                { name: "Yogurt", icon: "🥣" },
                { name: "Ice", icon: "🧊" },
                { name: "Honey", icon: "🍯" }
            ],
            longDescription: "Our smoothies are blended with fresh fruits, creamy yogurt, and a touch of honey. Choose between our mixed berry blend or tropical fruit mixture for a refreshing and nutritious treat."
        }
    ]
};