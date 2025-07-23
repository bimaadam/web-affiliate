// Product Data - Will be loaded from product.json
let productsData = [];

// Global Variables
let currentFilter = "all";
let displayedProducts = 6;
let isLoading = false; // To prevent multiple loads
const productsPerPage = 6; // Number of products to load at once

// DOM Elements
const navbar = document.querySelector(".navbar");
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const productsGrid = document.getElementById("products-grid");
const filterButtons = document.querySelectorAll(".filter-btn");
const loadMoreBtn = document.getElementById("load-more-btn");
const backToTopBtn = document.getElementById("back-to-top");
const loadingOverlay = document.getElementById("loading-overlay");

// Modal Elements - New elements for product detail modal
const productDetailModal = document.getElementById("productDetailModal");
const closeButton = productDetailModal
  ? productDetailModal.querySelector(".close-button")
  : null;
const modalProductImage = document.getElementById("modalProductImage");
const modalProductName = document.getElementById("modalProductName");
const modalCurrentPrice = document.getElementById("modalCurrentPrice");
const modalOriginalPrice = document.getElementById("modalOriginalPrice");
const modalProductStars = document.getElementById("modalProductStars");
const modalRatingText = document.getElementById("modalRatingText");
const modalProductDescription = document.getElementById(
  "modalProductDescription"
);
const modalBuyButton = productDetailModal
  ? productDetailModal.querySelector(".modal-product-actions .btn-primary")
  : null; // "Tambah ke Keranjang" button in modal
const modalWishlistButton = productDetailModal
  ? productDetailModal.querySelector(".modal-product-actions .btn-secondary")
  : null; // "Tambah ke Wishlist" button in modal

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function scrollToProducts() {
  const section = document.getElementById("products"); // id sesuai
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  } else {
    console.log("Element #products ga ketemu cok");
  }
}

async function initializeApp() {
  await fetchProducts(); // Fetch products first
  setupEventListeners();
  displayProducts(); // Display initial products after fetching
  updateLoadMoreButton();
}

// Fetch Product Data
async function fetchProducts() {
  showLoading();
  try {
    // Adjust this path if product.json is in the same directory as main.js
    // If main.js is in 'js/' and product.json is in root, '../product.json' is correct.
    const response = await fetch("product.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    productsData = await response.json();
  } catch (error) {
    console.error("Failed to fetch product data:", error);
    productsGrid.innerHTML =
      "<p class='no-products-message'>Maaf, gagal memuat produk. Silakan coba lagi nanti.</p>";
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
  } finally {
    hideLoading();
  }
}

function setupEventListeners() {
  // Navigation toggle
  navToggle.addEventListener("click", toggleMobileMenu);

  // Filter buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", handleFilterClick);
  });

  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMoreProducts);
  }

  // Back to top button
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", scrollToTop);
  }

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

  // Modal Event Listeners
  if (closeButton) {
    closeButton.addEventListener("click", hideProductDetailModal);
  }
  if (productDetailModal) {
    window.addEventListener("click", (event) => {
      if (event.target === productDetailModal) {
        hideProductDetailModal();
      }
    });
  }
  window.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      productDetailModal &&
      productDetailModal.style.display === "block"
    ) {
      hideProductDetailModal();
    }
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
  // This showLoading/hideLoading here is for when filter/load more is clicked
  // Initial loading is handled by fetchProducts
  if (!isLoading) showLoading();

  setTimeout(() => {
    const filteredProducts = getFilteredProducts();
    const productsToShow = filteredProducts.slice(0, displayedProducts);

    productsGrid.innerHTML = ""; // Clear existing products

    if (productsToShow.length === 0) {
      productsGrid.innerHTML =
        "<p class='no-products-message'>Tidak ada produk yang ditemukan untuk kategori ini.</p>";
      if (loadMoreBtn) loadMoreBtn.style.display = "none";
    } else {
      productsToShow.forEach((product, index) => {
        const productCard = createProductCard(product);
        productCard.style.animationDelay = `${index * 0.1}s`;
        productsGrid.appendChild(productCard);
      });
    }

    hideLoading();
    updateLoadMoreButton();
  }, 500); // Small delay for visual effect
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card animate-in"; // Add animate-in class
  card.setAttribute("data-category", product.category);
  card.setAttribute("data-product-id", product.id); // Add product ID to card

  const stars = generateStars(product.rating);

  card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${
              product.badge
                ? `<div class="product-badge ${
                    product.badge
                  }">${product.badge.toUpperCase()}</div>`
                : ""
            }
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
                <span class="rating-text">(${product.reviews} ulasan)</span>
            </div>
            <div class="product-actions">
                <button class="btn-buy card-buy-btn" data-affiliate-link="${
                  product.affiliateLink
                }" data-product-name="${product.name}">
                    <i class="fas fa-shopping-cart"></i>
                    Beli Sekarang
                </button>
                <button class="btn-wishlist" data-product-id="${product.id}">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>
    `;

  // Add event listener to the entire card to open the modal
  card.addEventListener("click", (event) => {
    // Prevent opening modal if a button INSIDE the card is clicked
    if (
      !event.target.closest(".card-buy-btn") &&
      !event.target.closest(".btn-wishlist")
    ) {
      showProductDetail(product.id);
    }
  });

  // Add event listener to the "Beli Sekarang" button on the card
  const cardBuyButton = card.querySelector(".card-buy-btn");
  if (cardBuyButton) {
    cardBuyButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Stop propagation to prevent modal from opening
      buyProduct(
        cardBuyButton.dataset.affiliateLink,
        cardBuyButton.dataset.productName
      );
    });
  }

  // Add event listener to the "Wishlist" button on the card
  const cardWishlistButton = card.querySelector(".btn-wishlist");
  if (cardWishlistButton) {
    cardWishlistButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Stop propagation to prevent modal from opening
      addToWishlist(parseInt(cardWishlistButton.dataset.productId));
    });
  }

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
    gaming: "Gaming", // Pastikan ini ada di product.json jika digunakan
  };
  return categoryNames[category] || category; // Fallback to raw category name
}

// Filter Functions
function handleFilterClick(e) {
  const filter = e.target.getAttribute("data-filter");

  // Update active button
  filterButtons.forEach((btn) => btn.classList.remove("active"));
  e.target.classList.add("active");

  // Apply filter
  currentFilter = filter;
  displayedProducts = productsPerPage; // Reset count
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
    displayedProducts += productsPerPage;
    displayProducts(); // This will also call hideLoading and updateLoadMoreButton
    isLoading = false;
  }, 800);
}

function updateLoadMoreButton() {
  const filteredProducts = getFilteredProducts();
  if (displayedProducts >= filteredProducts.length) {
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
  } else {
    if (loadMoreBtn) loadMoreBtn.style.display = "inline-flex";
  }
}

// Category Click Handler
function handleCategoryClick(e) {
  const category = e.currentTarget.getAttribute("data-category");

  // Update filter
  currentFilter = category;
  displayedProducts = productsPerPage; // Reset count

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
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    showNotification("Ditambahkan ke wishlist!", "success");

    // Optionally update the heart icon on the card or modal
    // This part would require more complex DOM manipulation to target specific card buttons
    // For simplicity, we just show a notification here.
  } else {
    showNotification("Sudah ada di wishlist!", "info");
  }
}

// --- Modal Specific Functions ---
function showProductDetail(productId) {
  const product = productsData.find((p) => p.id === productId);

  if (!product || !productDetailModal) {
    // Ensure modal elements exist
    console.error("Product or modal elements not found for ID:", productId);
    return;
  }

  modalProductImage.src = product.image;
  modalProductImage.alt = product.name;
  modalProductName.textContent = product.name;
  modalCurrentPrice.textContent = product.price; // Use string price directly

  if (product.originalPrice) {
    modalOriginalPrice.textContent = product.originalPrice; // Use string originalPrice directly
    modalOriginalPrice.style.display = "inline";
  } else {
    modalOriginalPrice.style.display = "none";
  }

  modalProductStars.innerHTML = generateStars(product.rating);
  modalRatingText.textContent = `(${product.reviews} ulasan)`;
  modalProductDescription.textContent =
    product.description || "Tidak ada deskripsi tersedia."; // Fallback for description

  // Set affiliate link for the "Beli Sekarang" button in the modal
  if (modalBuyButton) {
    modalBuyButton.onclick = () =>
      buyProduct(product.affiliateLink, product.name);
  }
  // You might want to update wishlist button in modal too if you track state
  // For now, it's just a placeholder button.

  productDetailModal.style.display = "block"; // Show modal
  document.body.style.overflow = "hidden"; // Disable body scroll
}

function hideProductDetailModal() {
  if (productDetailModal) {
    productDetailModal.style.display = "none";
  }
  document.body.style.overflow = "auto"; // Re-enable body scroll
}

// Utility Functions
function showLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.add("show");
  }
}

function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("show");
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <i class="fas fa-${
          type === "success" ? "check-circle" : "info-circle"
        }"></i>
        <span>${message}</span>
    `;

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
  if (scrollTop > 50) {
    // Changed from 100 to 50 for earlier effect
    navbar.classList.add("scrolled"); // Use class for styling
  } else {
    navbar.classList.remove("scrolled");
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

// Newsletter
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;

  if (email) {
    showNotification("Terima kasih sudah berlangganan!", "success");
    e.target.querySelector('input[type="email"]').value = "";
  }
}

// Animation Keyframes (should be in CSS, but included here for completeness)
// Consider moving these to your style.css for better separation
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

/* Add modal specific animations here if they are not in style.css */
@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 1;}
}

@keyframes slideInFromTop {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
`;

// Add animation styles to head (only if not already in style.css)
const style = document.createElement("style");
style.textContent = animationCSS;
document.head.appendChild(style);

// Search Functionality
// You need to ensure a search input element with id="searchInput" exists in your HTML
// For example: <input type="text" id="searchInput" placeholder="Cari produk...">
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  showLoading();
  setTimeout(() => {
    const activeCategory =
      document.querySelector(".filter-btn.active").dataset.filter;
    const filteredAndSearchedProducts = getFilteredAndSearchedProducts(
      activeCategory,
      searchTerm
    );
    displayedProducts = productsPerPage; // Reset count for search
    displayProductsGrid(
      filteredAndSearchedProducts.slice(0, displayedProducts)
    );
    updateLoadMoreButton();
    hideLoading();
  }, 500);
}

// Helper for combined filter and search (used in handleSearch and displayProducts)
function getFilteredAndSearchedProducts(category, searchTerm = "") {
  let filtered = productsData;

  if (category && category !== "all") {
    filtered = filtered.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm)) ||
        product.category.toLowerCase().includes(searchTerm)
    );
  }
  return filtered;
}

// A new function to display products without resetting displayedProducts count immediately
function displayProductsGrid(productsToDisplay) {
  productsGrid.innerHTML = "";
  if (productsToDisplay.length === 0) {
    productsGrid.innerHTML =
      "<p class='no-products-message'>Tidak ada produk yang ditemukan untuk kategori atau pencarian ini.</p>";
  } else {
    productsToDisplay.forEach((product, index) => {
      const productCard = createProductCard(product);
      productCard.style.animationDelay = `${index * 0.1}s`;
      productsGrid.appendChild(productCard);
    });
  }
}

// Re-evaluate displayProducts to use the combined filter and search
function displayProducts() {
  // This showLoading/hideLoading here is for when filter/load more is clicked
  // Initial loading is handled by fetchProducts
  if (!isLoading) showLoading();

  setTimeout(() => {
    const currentSearchTerm = document.getElementById("searchInput")
      ? document.getElementById("searchInput").value.toLowerCase()
      : "";
    const filteredAndSearchedProducts = getFilteredAndSearchedProducts(
      currentFilter,
      currentSearchTerm
    );
    const productsToShow = filteredAndSearchedProducts.slice(
      0,
      displayedProducts
    );

    displayProductsGrid(productsToShow); // Use the new function

    hideLoading();
    updateLoadMoreButton();
  }, 500); // Small delay for visual effect
}

// Error Handling
window.addEventListener("error", function (e) {
  console.error("BimaShop Error:", e.error);
});

// Console Welcome Message
console.log(`
🚀 BimaShop - Affiliate TikTok Shop Landing Page
📱 Version: 1.0.0
🛠️ Built with HTML, CSS, JavaScript
💡 Ready for You By Ignitron
`);
