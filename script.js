// Function to parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const obj = {};
        const currentline = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            let value = currentline[j] ? currentline[j].trim().replace(/^"|"$/g, '') : '';
            
            if (header === 'isNew') {
                value = value.toLowerCase() === 'true';
            }
            
            obj[header] = value;
        }
        
        result.push(obj);
    }
    
    return result;
}

// Function to load products from CSV
async function loadProducts() {
    try {
        const response = await fetch('products.csv');
        if (!response.ok) throw new Error('Failed to load products data');
        const csvText = await response.text();
        return parseCSV(csvText);
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
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300'">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-rating">
                <i class="fas fa-star"></i>
                <span>${product.rating}</span>
                <span class="product-orders">(${product.orders})</span>
            </div>
            <div class="product-pricing">
                <span class="product-price">$${product.price}</span>
                ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
            </div>
            <a href="${product.link}" target="_blank" class="view-deal-btn">View Deal</a>
        </div>
    </div>
    `;
}

// Function to get unique categories from products
function getUniqueCategories(products) {
    const categories = new Set();
    products.forEach(product => {
        if (product.category) {
            categories.add(product.category);
        }
    });
    return Array.from(categories);
}

// Function to format category names
function formatCategoryName(category) {
    return category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/\bAnd\b/, '&');
}

// Function to create category navigation links
function createCategoryLinks(categories) {
    // Desktop dropdown
    const dropdown = document.getElementById('categoryDropdown');
    if (dropdown) {
        dropdown.innerHTML = categories.map(category => `
            <a href="#" data-category="${category}">${formatCategoryName(category)}</a>
        `).join('');
    }
    
    // Mobile menu
    const mobileLinks = document.getElementById('mobileCategoryLinks');
    if (mobileLinks) {
        mobileLinks.innerHTML = categories.map(category => `
            <a href="#" class="mobile-nav-link" data-category="${category}">${formatCategoryName(category)}</a>
        `).join('');
    }
}

// Function to setup dropdown functionality
function setupDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const dropbtn = document.querySelector('.dropbtn');
    
    if (dropdown && dropbtn) {
        // Toggle dropdown on button click
        dropbtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Close when clicking outside
        document.addEventListener('click', function() {
            dropdown.classList.remove('active');
        });
        
        // Prevent dropdown from closing when clicking inside it
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Function to render products and categories
async function renderProductsAndCategories() {
    const products = await loadProducts();
    const categories = getUniqueCategories(products);
    
    // Create category navigation
    createCategoryLinks(categories);
    
    // Clear existing content (except Latest Deals)
    const mainContent = document.querySelector('.main-content .container');
    const latestDealsSection = document.querySelector('.category-section');
    mainContent.innerHTML = '';
    mainContent.appendChild(latestDealsSection);
    
    // Create category sections
    categories.forEach(category => {
        const section = document.createElement('section');
        section.className = 'category-section';
        section.id = category.toLowerCase();
        
        section.innerHTML = `
            <h2>${formatCategoryName(category)}</h2>
            <div class="products-scroll-container" id="${category}Grid"></div>
        `;
        
        mainContent.appendChild(section);
    });
    
    // Render products
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">No products found.</p>';
        return;
    }
    
    // Render products to their sections
    products.forEach(product => {
        const card = createProductCard(product);
        
        // Add to Latest Deals if new
        if (product.isNew === true || product.isNew === 'true') {
            productsGrid.innerHTML += card;
        }
        
        // Add to category section
        const categoryGrid = document.getElementById(`${product.category}Grid`);
        if (categoryGrid) {
            categoryGrid.innerHTML += card;
        }
    });
    
    setupCategoryFilters();
}

// Category filter functionality
function setupCategoryFilters() {
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
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
            
            // Close dropdown if open
            document.querySelector('.dropdown')?.classList.remove('active');
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
                    card.style.display = productName.includes(searchTerm) ? 'block' : 'none';
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
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Set current date
document.getElementById('updateDate').textContent = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderProductsAndCategories();
    setupSearch();
    setupDropdown(); // Initialize dropdown functionality
});
