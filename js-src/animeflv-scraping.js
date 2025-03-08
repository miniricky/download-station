(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('sites.php')) {
      document.querySelectorAll(".animeflv-status").forEach(button => {
        button.addEventListener("click", function() {
          getAnimeData(this.id);
        });
      });

      function getAnimeData(status) {
        const container = document.querySelector('#sites');
        const wrapper = container.querySelector('.progress-wrapper');
        let totalPages = 1;
        let page = 1;

        // Update fetch URLs to use PHP proxy
        fetch(`includes/animeflv/proxy.php?endpoint=anime-list&status=${status}&firstRequest=true`)
        .then(response => response.json())
        .then(data => {
          if (data.status === 'Error') {
            console.log(data.message);
            return;
          }

          totalPages = data.totalPages;
          page = 1; // Start from page 1

          createProgressBar(status, 0, wrapper, page, totalPages);
          scrapeNextPage();
        })
        .catch(error => console.error("Error getting page count:", error));
    
        function scrapeNextPage() {
          if (page > totalPages) {
            const progressBar = container.querySelector(`.progress.${status}`);
            if (progressBar) {
              updatedProgressBar(container, status, '100', page, totalPages);
            }
            return;
          }
  
          fetch(`includes/animeflv/proxy.php?endpoint=anime-list&page=${page}&status=${status}`)
          .then(response => response.json())
          .then(data => {
            const progress = Math.round((page / totalPages) * 100);
            const progressBar = container.querySelector(`.progress.${status}`);
            
            if (progressBar) {
              updatedProgressBar(container, status, progress, page, totalPages);
            }

            // Continue to next page even if current page has no content
            if (page < totalPages) {
              page++;
              scrapeNextPage();
            } else {
              if (progressBar) {
                updatedProgressBar(container, status, '100', totalPages, totalPages);
              }
            }
          })
          .catch(error => console.error("Scraping error:", error));
        }
      }

      /*
      * Function for add progress bar to canvas.
      */
      function createProgressBar(id, progress, wrapper, currentPage, totalPages) {
        let progressSection = wrapper.querySelector(".progress");
        if (progressSection) {
          progressSection.remove();
        }
        
        setTimeout(() => {
          const progressInfo = document.createElement('div');
          progressInfo.classList.add('progress-info', 'mb-2');
          progressInfo.innerHTML = `<span class="current-page-${id}">${currentPage} of ${totalPages} pages</span>`;
          
          const progressContainer = document.createElement('div');
          progressContainer.classList.add('progress', id);
          progressContainer.setAttribute('role', 'progressbar');
          progressContainer.setAttribute('aria-label', 'Example with label');
          progressContainer.setAttribute('aria-valuenow', '25');
          progressContainer.setAttribute('aria-valuemin', '0');
          progressContainer.setAttribute('aria-valuemax', '100');

          const progressBar = document.createElement('div');
          progressBar.classList.add('progress-bar');
          progressBar.style.width = progress + '%';
          progressBar.textContent = progress + '%';
          progressContainer.appendChild(progressBar);

          wrapper.appendChild(progressInfo);
          wrapper.appendChild(progressContainer);
        }, 500);
      }

      function updatedProgressBar(container, status, progress, currentPage, totalPagesCount) {
        const progressBar = container.querySelector(`.progress.${status} .progress-bar`);
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';

        const progressContainer = progressBar.parentElement;
        progressContainer.setAttribute('aria-valuenow', progress + '%');

        const currentPageSpan = container.querySelector(`.current-page-${status}`);
        if (currentPageSpan) {
          currentPageSpan.textContent = currentPage + ' of ' + totalPagesCount + ' pages';
        }
      }
    }
  });
})(jQuery);