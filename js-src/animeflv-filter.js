(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('animeflv.php')) {
      const container = document.querySelector('#animeflv');
      let searchTimeout;

      function updateContent(page = 1, isSearch = false) {
        const searchInput = container.querySelector('#animeSearch');
        const checkboxes = container.querySelectorAll('.genre-filter');
        const searchTerm = searchInput.value.trim();
        const searchParams = new URLSearchParams();
        
        if (isSearch) {
          checkboxes.forEach(checkbox => checkbox.checked = false);
          if (searchTerm) {
            searchParams.append('search', searchTerm);
          }
        } else {
          searchInput.value = '';
          checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
              searchParams.append('genre[]', checkbox.value);
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

            reattachEventListeners(isSearch);
          })
          .catch(error => console.error('Error:', error));
      }

      function attachFilterListeners() {
        container.querySelectorAll('.genre-filter').forEach(checkbox => {
          checkbox.addEventListener('change', () => updateContent(1, false));
        });
      }

      function reattachEventListeners(isSearch) {
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