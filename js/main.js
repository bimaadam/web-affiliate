// Product Data - Replace with your actual TikTok Shop affiliate links
let productsData = [];

fetch("../product.json")
  .then((res) => res.json())
  .then((data) => {
    productsData = data;
  });

// Global Variables
let currentFilter = "all";
let displayedProducts = 6;
let isLoading = false;

// DOM Elements
const navbar = document.querySelector(".navbar");
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const productsGrid = document.getElementById("products-grid");
const filterButtons = document.querySelectorAll(".filter-btn");
const loadMoreBtn = document.getElementById("load-more-btn");
const backToTopBtn = document.getElementById("back-to-top");
const loadingOverlay = document.getElementById("loading-overlay");

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  setupEventListeners();
  displayProducts();
  updateLoadMoreButton();
}

function setupEventListeners() {
  // Navigation toggle
  navToggle.addEventListener("click", toggleMobileMenu);

  // Filter buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", handleFilterClick);
  });

  // Load more button
  loadMoreBtn.addEventListener("click", loadMoreProducts);

  // Back to top button
  backToTopBtn.addEventListener("click", scrollToTop);

  // Scroll events
  window.addEventListener("scroll", handleScroll);

  // Category cards
  const categoryCards = document.querySelectorAll(".category-card");
  categoryCards.forEach((card) => {
    card.addEventListener("click", handleCategoryClick);
  });

  // Newsletter form
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", handleNewsletterSubmit);
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", handleNavLinkClick);
  });
}

// Navigation Functions
function toggleMobileMenu() {
  navMenu.classList.toggle("active");
  navToggle.classList.toggle("active");
}

function handleNavLinkClick(e) {
  e.preventDefault();
  const targetId = e.target.getAttribute("href");
  const targetSection = document.querySelector(targetId);

  if (targetSection) {
    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Close mobile menu if open
  navMenu.classList.remove("active");
  navToggle.classList.remove("active");
}

// Product Display Functions
function displayProducts() {
  showLoading();

  setTimeout(() => {
    const filteredProducts = getFilteredProducts();
    const productsToShow = filteredProducts.slice(0, displayedProducts);

    productsGrid.innerHTML = "";

    productsToShow.forEach((product, index) => {
      const productCard = createProductCard(product);
      productCard.style.animationDelay = `${index * 0.1}s`;
      productsGrid.appendChild(productCard);
    });

    hideLoading();
    updateLoadMoreButton();
  }, 500);
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.setAttribute("data-category", product.category);

  const stars = generateStars(product.rating);

  card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-badge ${product.badge}">${
    product.badge === "sale" ? "SALE" : "NEW"
  }</div>
        </div>
        <div class="product-info">
            <div class="product-category">${getCategoryName(
              product.category
            )}</div>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">
                <span class="current-price">${product.price}</span>
                ${
                  product.originalPrice
                    ? `<span class="original-price">${product.originalPrice}</span>`
                    : ""
                }
            </div>
            <div class="product-rating">
                <div class="stars">${stars}</div>
                <span class="rating-text">(${product.reviews} reviews)</span>
            </div>
            <div class="product-actions">
                <button class="btn-buy" onclick="buyProduct('${
                  product.affiliateLink
                }', '${product.name}')">
                    <i class="fas fa-shopping-cart"></i>
                    Beli Sekarang
                </button>
                <button class="btn-wishlist" onclick="addToWishlist(${
                  product.id
                })">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>
    `;

  return card;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let starsHTML = "";

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }

  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }

  return starsHTML;
}

function getCategoryName(category) {
  const categoryNames = {
    smartphone: "Smartphone",
    laptop: "Laptop",
    komputer: "Komputer",
    aksesoris: "Aksesoris",
    charger: "Charger",
    gaming: "Gaming",
  };
  return categoryNames[category] || category;
}

// Filter Functions
function handleFilterClick(e) {
  const filter = e.target.getAttribute("data-filter");

  // Update active button
  filterButtons.forEach((btn) => btn.classList.remove("active"));
  e.target.classList.add("active");

  // Apply filter
  currentFilter = filter;
  displayedProducts = 6;
  displayProducts();
}

function getFilteredProducts() {
  if (currentFilter === "all") {
    return productsData;
  }
  return productsData.filter((product) => product.category === currentFilter);
}

// Load More Function
function loadMoreProducts() {
  if (isLoading) return;

  isLoading = true;
  showLoading();

  setTimeout(() => {
    displayedProducts += 6;
    displayProducts();
    isLoading = false;
  }, 800);
}

function updateLoadMoreButton() {
  const filteredProducts = getFilteredProducts();
  if (displayedProducts >= filteredProducts.length) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "inline-flex";
  }
}

// Category Click Handler
function handleCategoryClick(e) {
  const category = e.currentTarget.getAttribute("data-category");

  // Update filter
  currentFilter = category;
  displayedProducts = 6;

  // Update active filter button
  filterButtons.forEach((btn) => {
    if (btn.getAttribute("data-filter") === category) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Scroll to products section
  document.getElementById("products").scrollIntoView({
    behavior: "smooth",
  });

  // Display filtered products
  displayProducts();
}

// Product Actions
function buyProduct(affiliateLink, productName) {
  // Track the click for analytics (optional)
  if (typeof gtag !== "undefined") {
    gtag("event", "affiliate_click", {
      product_name: productName,
      affiliate_link: affiliateLink,
    });
  }

  // Open affiliate link in new tab
  window.open(affiliateLink, "_blank");

  // Show success message (optional)
  showNotification("Redirecting to TikTok Shop...", "success");
}

function addToWishlist(productId) {
  // Get current wishlist from localStorage (if you want to implement this)
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    showNotification("Added to wishlist!", "success");

    // Update wishlist button
    event.target.innerHTML = '<i class="fas fa-heart"></i>';
    event.target.style.background = "#fca5a5";
    event.target.style.color = "#dc2626";
  } else {
    showNotification("Already in wishlist!", "info");
  }
}

// Utility Functions
function showLoading() {
  loadingOverlay.classList.add("show");
}

function hideLoading() {
  loadingOverlay.classList.remove("show");
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <i class="fas fa-${
          type === "success" ? "check-circle" : "info-circle"
        }"></i>
        <span>${message}</span>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : "#6366f1"};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Scroll Functions
function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Navbar scroll effect
  if (scrollTop > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 20px rgba(0,0,0,0.1)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "none";
  }

  // Back to top button
  if (scrollTop > 500) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function scrollToProducts() {
  document.getElementById("products").scrollIntoView({
    behavior: "smooth",
  });
}

// Newsletter
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;

  if (email) {
    showNotification("Thank you for subscribing!", "success");
    e.target.querySelector('input[type="email"]').value = "";
  }
}

// Animation Keyframes (add to CSS)
const animationCSS = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

// Add animation styles to head
const style = document.createElement("style");
style.textContent = animationCSS;
document.head.appendChild(style);

// Performance Optimization: Lazy Loading Images
function setupLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }
}

// Search Functionality (bonus feature)
function initializeSearch() {
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Cari produk...";
  searchInput.className = "search-input";

  searchInput.addEventListener("input", handleSearch);

  // Add search input to navbar (optional)
  // navContainer.appendChild(searchInput);
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const products = document.querySelectorAll(".product-card");

  products.forEach((product) => {
    const productName = product
      .querySelector(".product-name")
      .textContent.toLowerCase();
    if (productName.includes(searchTerm)) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
}

// Error Handling
window.addEventListener("error", function (e) {
  console.error("BimaShop Error:", e.error);
  // You can implement error tracking here
});

// Console Welcome Message
console.log(`
🚀 BimaShop - Affiliate TikTok Shop Landing Page
📱 Version: 1.0.0
🛠️  Built with HTML, CSS, JavaScript
💡 Ready for your affiliate links!
`);
