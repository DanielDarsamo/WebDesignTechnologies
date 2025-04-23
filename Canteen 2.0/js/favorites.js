/**
 * Favorites Controller - Handles favorites functionality
 */
const FavoritesController = (function() {
    // Favorites data
    let favorites = [];
    
    // Find item in menu data
    const findMenuItem = function(id) {
        for (const category in menuData) {
            const item = menuData[category].find(item => item.id === id);
            if (item) return item;
        }
        return null;
    };
    
    // Save favorites to local storage
    const saveFavoritesToStorage = function() {
        localStorage.setItem('darsamoFavorites', JSON.stringify(favorites));
    };
    
    // Load favorites from local storage
    const loadFavoritesFromStorage = function() {
        const storedFavorites = localStorage.getItem('darsamoFavorites');
        if (storedFavorites) {
            favorites = JSON.parse(storedFavorites);
        }
    };
    
    // Public methods
    return {
        // Initialize favorites
        init: function() {
            loadFavoritesFromStorage();
            UIController.updateFavoritesUI(favorites);
        },
        
        // Get favorites
        getFavorites: function() {
            return [...favorites];
        },
        
        // Get favorite items with details
        getFavoriteItems: function() {
            return favorites.map(id => findMenuItem(id)).filter(item => item !== null);
        },
        
        // Add to favorites
        addToFavorites: function(itemId) {
            if (!favorites.includes(itemId)) {
                favorites.push(itemId);
                
                // Update UI and save
                UIController.updateFavoritesUI(favorites);
                saveFavoritesToStorage();
                
                return true;
            }
            return false;
        },
        
        // Remove from favorites
        removeFromFavorites: function(itemId) {
            favorites = favorites.filter(id => id !== itemId);
            
            // Update UI and save
            UIController.updateFavoritesUI(favorites);
            saveFavoritesToStorage();
            
            return true;
        },
        
        // Toggle favorite status
        toggleFavorite: function(itemId) {
            if (this.isFavorite(itemId)) {
                return this.removeFromFavorites(itemId);
            } else {
                return this.addToFavorites(itemId);
            }
        },
        
        // Check if item is favorite
        isFavorite: function(itemId) {
            return favorites.includes(itemId);
        }
    };
})();