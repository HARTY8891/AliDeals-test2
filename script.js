// Function to parse CSV data with proper comma handling
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    const csvRegex = /(?:,"|^")(""|[\w\W]*?)(?=",|"$)|(?:,(?!")|^(?!"))([^,]*?)(?=$|,)|(\r\n|\n)/g;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const obj = {};
        let matches;
        let index = 0;
        
        csvRegex.lastIndex = 0;
        while ((matches = csvRegex.exec(line)) !== null) {
            if (index >= headers.length) break;
            
            let value = matches[1] || matches[2] || '';
            value = value.trim().replace(/""/g, '"');
            
            if (headers[index] === 'isNew') {
                value = value.toLowerCase() === 'true';
            }
            
            obj[headers[index]] = value;
            index++;
        }

        if (Object.keys(obj).length === headers.length) {
            result.push(obj);
        }
    }

    return result;
}

// Function to load products from CSV
async function loadProducts() {
    try {
        const response = await fetch('products.csv');
        if (!response.ok) throw new Error('Failed to load products data');
        
        const csvText = await response.text();
        const products = parseCSV(csvText);
        
        console.log('Parsed products:', products); // Debug output
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// Function to create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card" data-category="${product.category}" data-name="${product.name.toLowerCase()}">
            ${product.isNew ? '<div class="deal-badge">NEW</div>' : ''}
            <div class="p-4">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300'">
                </div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <span>${product.rating}</span>
                    <span class="product-orders">(${product.orders})</span>
                </div>
                <div class="product-price-container">
                    <div class="price-container">
                        <span class="product-price">$${product.price}</span>
                        ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
                    </div>
                    <a href="${product.link}" target="_blank" class="view-deal">View Deal</a>
                </div>
            </div>
        </div>
    `;
}

// Function to render products
async function renderProducts() {
    const products = await loadProducts();
    const productsGrid = document.getElementById('productsGrid');
    const electronicsGrid = document.getElementById('electronicsGrid');
    const homeGrid = document.getElementById('homeGrid');
    const fashionGrid = document.getElementById('fashionGrid');
    
    // Clear existing content
    productsGrid.innerHTML = '';
    electronicsGrid.innerHTML = '';
    homeGrid.innerHTML = '';
    fashionGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="col-span-full text-center py-8">No products found. Please check the products.csv file.</p>';
        return;
    }
    
    // Render all products in the main grid
    products.forEach(product => {
        const card = createProductCard(product);
        productsGrid.innerHTML += card;
        
        // Render to category-specific grids
        if (product.category === 'electronics') {
            electronicsGrid.innerHTML += card;
        } else if (product.category === 'home') {
            homeGrid.innerHTML += card;
        } else if (product.category === 'fashion') {
            fashionGrid.innerHTML += card;
        }
        // Add more categories as needed
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
                
                productCards.forEach(card => {
                    const productName = card.getAttribute('data-name');
                    if (productName.includes(searchTerm)) {
                        card.style.display = 'block';
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

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('open');
        mobileMenu.classList.toggle('closed');
        mobileSearch.classList.add('hidden');
    });
}

if (searchToggle) {
    searchToggle.addEventListener('click', function() {
        mobileSearch.classList.toggle('hidden');
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('closed');
    });
}

// Back to top button
const backToTopButton = document.getElementById('backToTop');

if (backToTopButton) {
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
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Set current date
    const updateDateElement = document.getElementById('updateDate');
    if (updateDateElement) {
        updateDateElement.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    await renderProducts();
    setupSearch();
});
