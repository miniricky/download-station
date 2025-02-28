(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('animeflv.php')) {
      const container = document.querySelector('#animeflv');
      const checkboxes = container.querySelectorAll('.genre-filter');
      const searchInput = container.querySelector('#animeSearch');
      let searchTimeout;

      function updateContent(page = 1) {
        const selectedGenres = [];
        const searchTerm = searchInput.value.trim();
        
        checkboxes.forEach(checkbox => {
          if (checkbox.checked) {
            selectedGenres.push(checkbox.value);
          }
        });

        const searchParams = new URLSearchParams();
        if (selectedGenres.length > 0) {
          selectedGenres.forEach(genre => {
            searchParams.append('genre[]', genre);
          });
        }
        if (searchTerm) {
          searchParams.append('search', searchTerm);
        }
        searchParams.append('page', page);

        fetch(`../includes/animeflv/filter.php?${searchParams.toString()}`)
          .then(response => response.json())
          .then(data => {
            const animeContainer = container.querySelector('.anime-container .row');
            const paginationContainer = container.querySelector('.pagination-row nav');
            
            animeContainer.innerHTML = data.content;
            paginationContainer.innerHTML = data.pagination;

            // Reattach event listeners
            reattachEventListeners();

            // Update URL without reloading
            const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }

      function reattachEventListeners() {
        // Reattach viewChapters listeners
        container.querySelectorAll('.viewChapters').forEach(button => {
          button.addEventListener('click', function() {
            const animeId = this.closest('.anime').getAttribute('id');
            const existingDetail = document.querySelector('.anime-detail');
            
            if (existingDetail && existingDetail.getAttribute('data-anime-id') === animeId) {
              return;
            }

            window.animeflv.insertContainer(this, container);
          });
        });

        // Reattach pagination listeners
        container.querySelectorAll('.pagination .page-link').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
              updateContent(parseInt(page));
            }
          });
        });
      }

      // Add change event listener to checkboxes
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => updateContent());
      });

      // Add input event listener to search
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          updateContent();
        }, 500);
      });
    }
  });
})(jQuery);