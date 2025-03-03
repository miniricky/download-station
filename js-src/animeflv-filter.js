(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('animeflv.php')) {
      const container = document.querySelector('#animeflv');
      let searchTimeout;

      /**
       * Function to update the content of the container.
       */
      function updateContent(page = 1, isSearch = false) {
        const searchInput = container.querySelector('#animeSearch');
        const genreCheckboxes = container.querySelectorAll('.genre-filter');
        const statusCheckboxes = container.querySelectorAll('.status-filter');
        const typeCheckboxes = container.querySelectorAll('.type-filter');
        const searchTerm = searchInput.value.trim();
        const searchParams = new URLSearchParams();
        
        if (isSearch) {
          // Reset all filters
          genreCheckboxes.forEach(checkbox => checkbox.checked = false);
          statusCheckboxes.forEach(checkbox => checkbox.checked = false);
          typeCheckboxes.forEach(checkbox => checkbox.checked = false);
          if (searchTerm) {
            searchParams.append('search', searchTerm);
          }
        } else {
          searchInput.value = '';
          // Add filters
          genreCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
              searchParams.append('genre[]', checkbox.value);
            }
          });
          statusCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
              searchParams.append('status[]', checkbox.value);
            }
          });
          typeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
              searchParams.append('type[]', checkbox.value);
            }
          });
        }

        searchParams.append('page', page);

        fetch(`../includes/animeflv/filter.php?${searchParams.toString()}`)
          .then(response => response.json())
          .then(data => {
            const animeContainer = container.querySelector('.anime-container .row');
            const paginationContainer = container.querySelector('.pagination-row nav');
            
            animeContainer.innerHTML = data.content;
            paginationContainer.innerHTML = data.pagination;
      
            // Actualizar los tipos disponibles
            if (data.available_types) {
              updateAvailableTypes(data.available_types);
            }
      
            reattachEventListeners(isSearch);
          })
          .catch(error => console.error('Error:', error));
      }

      /**
       * Function to update the available types.
       */
      function updateAvailableTypes(availableTypes) {
        const typeContainer = container.querySelector('.type-wrapper .dropdown-menu');
        if (typeContainer) {
          const typeCheckboxes = typeContainer.querySelectorAll('.type-filter');
          typeCheckboxes.forEach(checkbox => {
            const type = checkbox.value;
            if (!availableTypes.includes(type)) {
              checkbox.closest('.dropdown-item').style.display = 'none';
            } else {
              checkbox.closest('.dropdown-item').style.display = '';
            }
          });
        }
      }

      /**
       * Function to attach filter listeners.
       */
      function attachFilterListeners() {
        // Genre filters
        container.querySelectorAll('.genre-filter').forEach(checkbox => {
          checkbox.addEventListener('change', () => updateContent(1, false));
        });
        
        // Status filters
        container.querySelectorAll('.status-filter').forEach(checkbox => {
          checkbox.addEventListener('change', () => updateContent(1, false));
        });
  
        // Type filters
        container.querySelectorAll('.type-filter').forEach(checkbox => {
          checkbox.addEventListener('change', () => updateContent(1, false));
        });
      }

      /**
       * Function to reattach event listeners.
       */
      function reattachEventListeners(isSearch) {
        container.querySelectorAll('.viewEpisodes').forEach(button => {
          button.addEventListener('click', function() {
            const animeId = this.closest('.anime').getAttribute('id');
            const existingDetail = document.querySelector('.anime-detail');
            if (existingDetail && existingDetail.getAttribute('data-anime-id') === animeId) {
              return;
            }
            window.animeflv.insertContainer(this, container);
          });
        });

        container.querySelectorAll('.pagination .page-link').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
              updateContent(parseInt(page), isSearch);
            }
          });
        });
      }

      // Initial attachment of filter listeners
      attachFilterListeners();

      // Search listener
      const searchInput = container.querySelector('#animeSearch');
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          updateContent(1, true);
        }, 500);
      });
    }
  });
})(jQuery);