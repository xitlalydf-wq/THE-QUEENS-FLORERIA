// Cart management system using localStorage
class CartManager {
    constructor() {
        this.storageKey = 'thequeens_cart';
        this.cart = this.loadCart();
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const cart = localStorage.getItem(this.storageKey);
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Add product to cart
    addProduct(product) {
        const existingItem = this.cart.find(item => item.id === product.id && item.tipo === product.tipo);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                nombre: product.Nombre,
                precio: parseFloat(product.Precio),
                imagen: product.ImagenURL || '/images/placeholder.png',
                categoria: product.Categoria,
                tipo: product.tipo,
                stock: product.Stock,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCounter();
        this.showNotification(`${product.Nombre} agregado al carrito`);
    }

    // Update product quantity
    updateQuantity(productId, productType, newQuantity) {
        const item = this.cart.find(item => item.id === productId && item.tipo === productType);
        if (item) {
            if (newQuantity <= 0) {
                this.removeProduct(productId, productType);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartCounter();
            }
        }
    }

    // Remove product from cart
    removeProduct(productId, productType) {
        this.cart = this.cart.filter(item => !(item.id === productId && item.tipo === productType));
        this.saveCart();
        this.updateCartCounter();
    }

    // Get all cart items
    getItems() {
        return this.cart;
    }

    // Get total number of items
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Get total price
    getTotalPrice() {
        return this.cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    // Show notification
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-family: 'Poppins', sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Update cart counter display
    updateCartCounter() {
        const counter = document.getElementById('cart-counter');
        if (counter) {
            const totalItems = this.getTotalItems();
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
}

// Global cart instance
const cartManager = new CartManager();

// Initialize cart counter on page load
document.addEventListener('DOMContentLoaded', () => {
    cartManager.updateCartCounter();
});

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);