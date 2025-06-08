// Enhanced Product Filtering and Sorting
document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.querySelector('.shop-grid');
  const categoryFilter = document.getElementById('category-filter');
  const priceRangeFilter = document.getElementById('price-range');
  const searchInput = document.getElementById('product-search');
  const sortSelect = document.getElementById('sort-by');

  // Filter products based on all criteria
  function filterProducts() {
    const category = categoryFilter.value;
    const priceRange = priceRangeFilter.value;
    const searchTerm = searchInput.value.toLowerCase().trim();
    const products = document.querySelectorAll('.product-card');
    let hasResults = false;

    products.forEach(product => {
      const productPrice = parseFloat(product.dataset.price);
      const productCategory = product.dataset.category;
      const productName = product.querySelector('h3').textContent.toLowerCase();
      const productDesc = product.querySelector('.product-description').textContent.toLowerCase();
      
      // Category match
      let categoryMatch = !category || productCategory === category;
      
      // Price range match
      let priceMatch = true;
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (max) {
          priceMatch = productPrice >= min && productPrice <= max;
        } else {
          priceMatch = productPrice >= min;
        }
      }
      
      // Search term match
      let searchMatch = !searchTerm || 
                       productName.includes(searchTerm) || 
                       productDesc.includes(searchTerm) ||
                       productCategory.toLowerCase().includes(searchTerm);
      
      const isVisible = categoryMatch && priceMatch && searchMatch;
      product.style.display = isVisible ? 'block' : 'none';
      
      if (isVisible) {
        hasResults = true;
        // Highlight search terms
        if (searchTerm) {
          const nameElement = product.querySelector('h3');
          const descElement = product.querySelector('.product-description');
          
          nameElement.innerHTML = nameElement.textContent.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
          );
          
          descElement.innerHTML = descElement.textContent.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
          );
        }
      }
    });

    // Show/hide no results message
    const noResults = document.getElementById('no-results');
    if (!hasResults && !noResults) {
      const message = document.createElement('div');
      message.id = 'no-results';
      message.className = 'no-results';
      message.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms</p>
        <button type="button" class="reset-filters">Reset All Filters</button>
      `;
      productGrid.appendChild(message);
      
      // Add reset functionality
      message.querySelector('.reset-filters').addEventListener('click', () => {
        categoryFilter.value = '';
        priceRangeFilter.value = '';
        searchInput.value = '';
        sortSelect.value = '';
        filterProducts();
      });
    } else if (hasResults) {
      noResults?.remove();
    }
  }

  // Sort products
  function sortProducts() {
    const sortBy = sortSelect.value;
    const products = Array.from(productGrid.children).filter(el => el.classList.contains('product-card'));
    
    // Remove no results message if present
    document.getElementById('no-results')?.remove();

    products.sort((a, b) => {
      const priceA = parseFloat(a.dataset.price);
      const priceB = parseFloat(b.dataset.price);
      const nameA = a.querySelector('h3').textContent.toLowerCase();
      const nameB = b.querySelector('h3').textContent.toLowerCase();
      const categoryA = a.dataset.category;
      const categoryB = b.dataset.category;

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'category':
          return categoryA.localeCompare(categoryB);
        default:
          return 0;
      }
    });

    // Animate the reordering
    products.forEach((product, index) => {
      product.style.order = index;
      product.style.opacity = '0';
      setTimeout(() => {
        product.style.opacity = '1';
      }, 50 * index);
    });
  }

  // Add event listeners
  categoryFilter.addEventListener('change', filterProducts);
  priceRangeFilter.addEventListener('change', filterProducts);
  searchInput.addEventListener('input', filterProducts);
  sortSelect.addEventListener('change', () => {
    sortProducts();
    filterProducts();
  });

  // Add filter tags
  function addFilterTags() {
    const filterTags = document.createElement('div');
    filterTags.className = 'filter-tags';
    document.querySelector('.shop-controls').appendChild(filterTags);

    function updateFilterTags() {
      filterTags.innerHTML = '';
      const activeFilters = [];

      if (categoryFilter.value) {
        activeFilters.push({
          type: 'category',
          value: categoryFilter.options[categoryFilter.selectedIndex].text
        });
      }

      if (priceRangeFilter.value) {
        activeFilters.push({
          type: 'price',
          value: priceRangeFilter.options[priceRangeFilter.selectedIndex].text
        });
      }

      if (searchInput.value) {
        activeFilters.push({
          type: 'search',
          value: `"${searchInput.value}"`
        });
      }

      activeFilters.forEach(filter => {
        const tag = document.createElement('span');
        tag.className = 'filter-tag';
        tag.innerHTML = `
          ${filter.value}
          <button type="button" class="remove-filter" data-type="${filter.type}">×</button>
        `;
        filterTags.appendChild(tag);
      });

      // Add event listeners to remove buttons
      filterTags.querySelectorAll('.remove-filter').forEach(button => {
        button.addEventListener('click', () => {
          const type = button.dataset.type;
          switch (type) {
            case 'category':
              categoryFilter.value = '';
              break;
            case 'price':
              priceRangeFilter.value = '';
              break;
            case 'search':
              searchInput.value = '';
              break;
          }
          filterProducts();
        });
      });
    }

    // Update filter tags when filters change
    categoryFilter.addEventListener('change', updateFilterTags);
    priceRangeFilter.addEventListener('change', updateFilterTags);
    searchInput.addEventListener('input', updateFilterTags);
  }

  // Initialize
  addFilterTags();
}); 