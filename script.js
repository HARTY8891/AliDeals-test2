// ====================
// LANGUAGE MANAGEMENT
// ====================
let currentLanguage = 'he'; // Set Hebrew as default

function toggleRTL(isRTL) {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    const rtlStylesheet = document.getElementById('rtl-stylesheet');
    if (rtlStylesheet) {
        rtlStylesheet.disabled = !isRTL;
    }
}

function translateStaticElements(lang) {
    // Update all elements with data translation attributes
    document.querySelectorAll('[data-en], [data-he]').forEach(el => {
        if (el.dataset[lang]) {
            if (el.tagName === 'INPUT' && el.placeholder) {
                el.placeholder = el.dataset[lang];
            } else {
                el.textContent = el.dataset[lang];
            }
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang); // Save preference
    toggleRTL(lang === 'he');
    translateStaticElements(lang);
    renderProducts(); // Re-render products with correct language
}

// Initialize language switcher buttons
function initLanguageSwitcher() {
    // Load preferred language from storage or use default
    const savedLang = localStorage.getItem('preferredLanguage') || 'he';
    switchLanguage(savedLang);

    // Set up button click handlers
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            switchLanguage(this.dataset.lang);
        });
    });
}

// ====================
// CSV PARSING & PRODUCTS
// ====================
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    
    // Regex to handle quoted fields with commas
    const csvRegex = /(?:,"|^")(""|[\w\W]*?)(?=",|"$)|(?:,(?!")|^(?!"))([^,]*?)(?=$|,)/g;
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const obj = {};
        let matches;
        let index = 0;
        
        // Reset regex and get matches
        csvRegex.lastIndex = 0;
        while ((matches = csvRegex.exec(line)) !== null) {
            if (index >= headers.length) break;
            
            let value = matches[1] || matches[2] || '';
            value = value.trim().replace(/""/g, '"');
            
            // Special handling for boolean field
            if (headers[index] === 'isNew') {
                value = value.toLowerCase() === 'true';
            }
            
            obj[headers[index]] = value;
            index++;
        }
        
        if (Object.keys(obj).length > 0) {
            result.push(obj);
        }
    }
    
    return result;
}

async function loadProducts() {
    try {
        const response = await fetch('products.csv');
        if (!response.ok) throw new Error('Failed to load products data');
        const csvText = await response.text();
        const products = parseCSV(csvText);
        
        console.log('Loaded products:', products);
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// ====================
// PRODUCT RENDERING
// ====================
function createProductCard(product) {
    const name = currentLanguage === 'he' && product.name_he ? product.name_he : product.name;
    const category = currentLanguage === 'he' && product.category_he ? product.category_he : product.category;
    
    return `
    <div class="product-card" data-category="${product.category}" data-name="${name.toLowerCase()}">
        ${product.isNew ? '<div class="deal-badge">' + (currentLanguage === 'he' ? 'חדש' : 'NEW') + '</div>' : ''}
        <div class="product-image">
            <img src="${product.image}" alt="${name}" onerror="this.src='https://via.placeholder.com/300x300'">
        </div>
        <div class="product-info">
            <h3 class="product-name">${name}</h3>
            <div class="product-rating">
                <i class="fas fa-star"></i>
                <span>${product.rating}</span>
                <span class="product-orders">(${product.orders})</span>
            </div>
            <div class="product-pricing">
                <span class="product-price">$${product.price}</span>
                ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
            </div>
            <a href="${product.link}" target="_blank" class="view-deal-btn">
                ${currentLanguage === 'he' ? 'צפה במבצע' : 'View Deal'}
            </a>
        </div>
    </div>
    `;
}

async function renderProducts() {
    const products = await loadProducts();
    const categories = [...new Set(products.map(p => p.category))];
    
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
        
        const categoryName = currentLanguage === 'he' 
            ? products.find(p => p.category === category)?.category_he || category
            : category;
        
        section.innerHTML = `
            <h2>${formatCategoryName(categoryName)}</h2>
            <div class="products-scroll-container" id="${category}Grid"></div>
        `;
        
        mainContent.appendChild(section);
    });
    
    // Render products
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = products.length === 0 
        ? '<p class="no-products">' + (currentLanguage === 'he' ? 'לא נמצאו מוצרים' : 'No products found') + '</p>'
        : '';
    
    products.forEach(product => {
        const card = createProductCard(product);
        
        // Add to Latest Deals if new
        if (product.isNew) {
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

function formatCategoryName(category) {
    return category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/\bAnd\b/, '&');
}

// ====================
// UI FUNCTIONALITY
// ====================
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
            
            mobileMenu.classList.remove('open');
            mobileMenu.classList.add('closed');
            document.querySelector('.dropdown')?.classList.remove('active');
        });
    });
}

function setupDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const dropbtn = document.querySelector('.dropbtn');
    
    if (dropdown && dropbtn) {
        dropbtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', () => dropdown.classList.remove('active'));
        dropdown.addEventListener('click', e => e.stopPropagation());
    }
}

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
                document.querySelectorAll('.product-card').forEach(card => {
                    const productName = card.getAttribute('data-name');
                    card.style.display = productName.includes(searchTerm) ? 'block' : 'none';
                });
            });
        }
    });
}

// ====================
// INITIALIZATION
// ====================
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

const backToTopButton = document.getElementById('backToTop');
if (backToTopButton) {
    window.addEventListener('scroll', function() {
        backToTopButton.classList.toggle('visible', window.pageYOffset > 300);
    });
    backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

document.getElementById('updateDate').textContent = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initLanguageSwitcher();
    setupDropdown();
    setupSearch();
    renderProducts();
});
