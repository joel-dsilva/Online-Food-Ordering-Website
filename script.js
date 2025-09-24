// Cart functionality
let cart = [];

// Initialize when document is ready
$(document).ready(function() {
    loadCartFromStorage();
    setupEventListeners();
    checkBannerImage();
});

// Check if banner image loads properly
function checkBannerImage() {
    const banner = new Image();
    banner.src = 'food_banner.jpeg';
    banner.onload = function() {
        console.log('Banner image loaded successfully');
    };
    banner.onerror = function() {
        console.log('Banner image failed to load, using fallback');
        $('.hero-section').addClass('no-banner');
    };
}

// Setup event listeners
function setupEventListeners() {
    // Add to cart buttons
    $(document).on('click', '.add-to-cart', function() {
        const item = $(this).data('item');
        const price = parseInt($(this).data('price'));
        const restaurant = $(this).data('restaurant');
        addToCart(item, price, restaurant);
    });

    // Search functionality
    $('#searchInput').on('input', filterItems);
    $('#cuisineFilter, #priceFilter').on('change', filterItems);

    // Cart modal
    $('.cart-icon').on('click', function(e) {
        e.preventDefault();
        showCartModal();
    });

    // Checkout button
    $('#checkoutBtn').on('click', proceedToCheckout);

    // Order now button
    $('.order-btn').on('click', function() {
        $('html, body').animate({
            scrollTop: $('#menu-section').offset().top - 100
        }, 1000);
    });

    // Remove item from cart
    $(document).on('click', '.remove-item', function() {
        const itemId = parseInt($(this).data('item-id'));
        removeFromCart(itemId);
    });
}

// Add item to cart
function addToCart(item, price, restaurant) {
    const existingItem = cart.find(cartItem => 
        cartItem.item === item && cartItem.restaurant === restaurant
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(),
            item: item,
            price: price,
            restaurant: restaurant,
            quantity: 1
        });
    }

    updateCartDisplay();
    saveCartToStorage();
    showNotification(`${item} added to cart!`);
}

// Show cart modal
function showCartModal() {
    updateCartDisplay();
    $('#cartModal').modal('show');
}

// Update cart display
function updateCartDisplay() {
    const cartItems = $('#cartItems');
    const cartCount = $('#cartCount');
    const cartTotal = $('#cartTotal');

    cartItems.empty();

    if (cart.length === 0) {
        cartItems.html(`
            <div class="text-center py-4">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <p class="text-muted">Your cart is empty</p>
            </div>
        `);
    } else {
        cart.forEach(item => {
            const cartItemHtml = `
                <div class="cart-item">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-bold">${item.item}</h6>
                        <small class="text-muted">${item.restaurant}</small>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">₹${item.price} × ${item.quantity}</div>
                        <div class="fw-bold text-primary">₹${item.price * item.quantity}</div>
                        <button class="btn btn-sm btn-outline-danger remove-item mt-1" 
                                data-item-id="${item.id}">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
            cartItems.append(cartItemHtml);
        });
    }

    // Update counts
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.text(totalItems);
    cartTotal.text(totalPrice);
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
    saveCartToStorage();
    showNotification('Item removed from cart!');
}

// Filter items based on search and filters
function filterItems() {
    const searchTerm = $('#searchInput').val().toLowerCase();
    const cuisineFilter = $('#cuisineFilter').val();
    const priceFilter = $('#priceFilter').val();

    $('.restaurant-card').each(function() {
        const restaurant = $(this);
        const restaurantCuisine = restaurant.data('cuisine');
        const restaurantPrice = restaurant.data('price');
        const restaurantText = restaurant.text().toLowerCase();
        
        let visible = true;

        // Check cuisine filter
        if (cuisineFilter && restaurantCuisine !== cuisineFilter) {
            visible = false;
        }

        // Check price filter
        if (priceFilter && restaurantPrice !== priceFilter) {
            visible = false;
        }

        // Check search term
        if (searchTerm && !restaurantText.includes(searchTerm)) {
            visible = false;
        }

        restaurant.toggle(visible);
    });
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty! Please add some items before checkout.');
        return;
    }

    const orderDetails = cart.map(item => 
        `${item.item} (${item.restaurant}) - ₹${item.price} × ${item.quantity}`
    ).join('\n');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (confirm(`Order Summary:\n\n${orderDetails}\n\nTotal: ₹${total}\n\nConfirm order?`)) {
        alert('🎉 Order placed successfully! Thank you for choosing QuickBite!');
        
        // Clear cart
        cart = [];
        updateCartDisplay();
        saveCartToStorage();
        
        // Close modal
        $('#cartModal').modal('hide');
    }
}

// Show notification
function showNotification(message) {
    // Remove existing notifications
    $('.notification').remove();

    const notification = $(`
        <div class="alert alert-success alert-dismissible fade show notification" role="alert">
            <i class="fas fa-check-circle"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);

    $('body').append(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.alert('close');
    }, 3000);
}

// Local storage functions
function saveCartToStorage() {
    localStorage.setItem('quickbiteCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('quickbiteCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}