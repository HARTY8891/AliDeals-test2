// Function to create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card bg-white rounded-lg overflow-hidden shadow-md transition duration-300 relative" data-category="${product.category}" data-name="${product.name.toLowerCase()}">
            ${product.isNew ? '<div class="deal-badge">NEW</div>' : ''}
            <div class="p-4">
                <div class="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/300x300'">
                </div>
                <h3 class="font-medium mb-2">${product.name}</h3>
                <div class="flex items-center mb-2">
                    <i class="fas fa-star text-yellow-400 mr-1"></i>
                    <span class="text-sm mr-1">${product.rating}</span>
                    <span class="text-sm text-gray-500">(${product.orders})</span>
                </div>
                <div class="flex justify-between items-center">
                    <div>
                        <span class="text-lg font-bold text-red-500">$${product.price}</span>
                        ${product.oldPrice ? `<span class="text-sm text-gray-500 line-through block">$${product.oldPrice}</span>` : ''}
                    </div>
                    <a href="${product.link}" target="_blank" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition">View Deal</a>
                </div>
            </div>
        </div>
    `;
}

// Function to render products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const electronicsGrid = document.getElementById('electronicsGrid');
    const homeGrid = document.getElementById('homeGrid');
    const fashionGrid = document.getElementById('fashionGrid');
    
    // Clear existing content
    productsGrid.innerHTML = '';
    electronicsGrid.innerHTML = '';
    homeGrid.innerHTML = '';
    fashionGrid.innerHTML = '';
    
    // Render all products in the main grid
    products.forEach(product => {
        productsGrid.innerHTML += createProductCard(product);
        
        // Render to category-specific grids
        if (product.category === 'electronics') {
            electronicsGrid.innerHTML += createProductCard(product);
        } else if (product.category === 'home') {
            homeGrid.innerHTML += createProductCard(product);
        } else if (product.category === 'fashion') {
            fashionGrid.innerHTML += createProductCard(product);
        } else if (product.category === 'toys') {
            // You could add a toys grid if needed
        }
    });
    
    // Set up event listeners for filtering
    setupCategoryFilters();
}

// Set up category filter functionality
function setupCategoryFilters() {
    const categoryLinks = document.querySelectorAll('[data-category]');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // Scroll to the appropriate section
            if (category === 'all') {
                window.scrollTo({
                    top: document.querySelector('main').offsetTop - 20,
                    behavior: 'smooth'
                });
            } else {
                const section = document.getElementById(category);
                if (section) {
                    window.scrollTo({
                        top: section.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            }
            
            // Close mobile menu if open
            mobileMenu.classList.remove('open');
            mobileMenu.classList.add('closed');
        });
    });
}

// Search functionality
function setupSearch() {
    const searchInputs = [
        document.getElementById('desktopSearchInput'),
        document.getElementById('mobileSearchInput'),
        document.getElementById('menuSearchInput')
    ];
    
    searchInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const productCards = document.querySelectorAll('.product-card');
                let hasResults = false;
                
                productCards.forEach(card => {
                    const productName = card.getAttribute('data-name');
                    
                    if (productName.includes(searchTerm)) {
                        card.style.display = 'block';
                        hasResults = true;
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    });
}

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const searchToggle = document.getElementById('searchToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileSearch = document.getElementById('mobileSearch');

menuToggle.addEventListener('click', function() {
    mobileMenu.classList.toggle('open');
    mobileMenu.classList.toggle('closed');
    mobileSearch.classList.add('hidden');
});

searchToggle.addEventListener('click', function() {
    mobileSearch.classList.toggle('hidden');
    mobileMenu.classList.remove('open');
    mobileMenu.classList.add('closed');
});

// Back to top button
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.remove('opacity-0', 'invisible');
        backToTopButton.classList.add('opacity-100', 'visible');
    } else {
        backToTopButton.classList.remove('opacity-100', 'visible');
        backToTopButton.classList.add('opacity-0', 'invisible');
    }
});

backToTopButton.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Set current date
document.getElementById('updateDate').textContent = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Initialize the page
window.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    setupSearch();
});