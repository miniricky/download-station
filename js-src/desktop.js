(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('desktop.html')) {
      const container = document.querySelector('#desktop');

      let unique = 0;
      const scraping = container.querySelector('#initScraping');
      scraping.addEventListener('click', function () {
        if (unique === 0) {
          unique++;
          scrapingPagination(container);
        }
        else{
          showToast('There are active downloads')
        }
      });

      /*
      * Function for show toast.
      */
      function showToast(message) {
        const toastElement = document.querySelector('.toast');
        const toastBody = toastElement.querySelector('.toast-body');
        toastBody.textContent = message;

        const toast = new bootstrap.Toast(toastElement);
        toast.show();
      }

      /*
      * Function for create fetchRequest.
      */
      function fetchRequest(url, params, callback) {
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error in AJAX request: ' + response.statusText);
          }
          return response.json();
        })
        .then(responseData => {
          callback(null, responseData);
        })
        .catch(error => {
          callback(error, null);
        });
      }

      /*
      * Function for scraping pagination.
      */
      function scrapingPagination(container) {
        const data = `info=scraping-pagination&device=desktop`;
        fetchRequest('../includes/download-station.php', data, function (err, responseData) {
          if (err) {
            console.log('Error:', err);
            return;
          }

          createPagination(container, responseData.pagination.pages);
          addSearch(container);
          scrapingFLV(container, '1', responseData.pagination.pages);
        });
      }

      /*
      * Function for create pagination.
      */
      let currentPage = 1;
      const visibleButtons = 11;
      const sideButtons = Math.floor(visibleButtons / 2);
      function createPagination(container, totalPages) {
        setupPagination(container, totalPages);
      }

      /*
      * Function to configure pagination
      */
      function setupPagination(container, totalPages) {
        const wrapper = container.querySelector('.row');
        const pagination = document.createElement('div');
        pagination.classList.add('pagination-row');

        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Page navigation');
        pagination.appendChild(nav);

        const ul = document.createElement('ul');
        ul.classList.add('pagination');
        nav.appendChild(ul);

        // Botón "Previous"
        const prevLi = document.createElement('li');
        prevLi.classList.add('page-item');
        if (currentPage === 1) prevLi.classList.add('disabled');

        const prevButton = document.createElement('button');
        prevButton.classList.add('page-link');
        prevButton.textContent = 'Previous';
        prevButton.href = '#';
        prevLi.appendChild(prevButton);
        prevLi.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            updatePagination(container, wrapper, totalPages);
          }
        });
        ul.appendChild(prevLi);

        // Dynamic range of buttons
        let startPage = Math.max(1, currentPage - sideButtons);
        let endPage = Math.min(totalPages, currentPage + sideButtons);

        if (endPage - startPage < visibleButtons - 1) {
          if (currentPage <= sideButtons) {
            endPage = Math.min(totalPages, visibleButtons);
          } else if (currentPage > totalPages - sideButtons) {
            startPage = Math.max(1, totalPages - visibleButtons + 1);
          }
        }

        // Ellipsis and home button (if there are more pages before the first visible button)
        if (startPage > 1) {
          const firstLi = paginationButton(1, container, wrapper, totalPages);
          ul.appendChild(firstLi);

          const ellipsisLi = document.createElement('li');
          ellipsisLi.classList.add('page-item', 'disabled');
          const ellipsisButton = document.createElement('button');
          ellipsisButton.classList.add('page-link');
          ellipsisButton.textContent = '...';
          ellipsisLi.appendChild(ellipsisButton);
          ul.appendChild(ellipsisLi);
        }

        // Dynamic pagination buttons
        for (let i = startPage; i <= endPage; i++) {
          const li = paginationButton(i, container, wrapper, totalPages);
          ul.appendChild(li);
        }

        // Ellipsis and end button (if there are more pages after the last visible button)
        if (endPage < totalPages - 1) {
          const ellipsisLi = document.createElement('li');
          ellipsisLi.classList.add('page-item', 'disabled');
          const ellipsisButton = document.createElement('a');
          ellipsisButton.classList.add('page-link');
          ellipsisButton.textContent = '...';
          ellipsisLi.appendChild(ellipsisButton);
          ul.appendChild(ellipsisLi);
        }

        // Last button (always visible)
        if (endPage < totalPages) {
          const lastLi = paginationButton(totalPages, container, wrapper, totalPages);
          ul.appendChild(lastLi);
        }

        // "Next" button
        const nextLi = document.createElement('li');
        nextLi.classList.add('page-item');
        if (currentPage === totalPages) nextLi.classList.add('disabled');

        const nextButton = document.createElement('button');
        nextButton.classList.add('page-link');
        nextButton.textContent = 'Next';
        nextButton.href = '#';
        nextLi.appendChild(nextButton);
        nextLi.addEventListener('click', () => {
          if (currentPage < totalPages) {
            currentPage++;
            updatePagination(container, wrapper, totalPages);
          }
        });
        ul.appendChild(nextLi);

        wrapper.appendChild(pagination);
      }

      /*
      * Function to create pagination buttons
      */
      function paginationButton(page, container, wrapper, totalPages) {
        const li = document.createElement('li');
        li.classList.add('page-item');

        const button = document.createElement('button');
        button.classList.add('page-link');
        button.textContent = page;
        button.href = '#';
        li.appendChild(button);

        if (currentPage === page) li.classList.add('active');

        // Event when a page button is clicked
        li.addEventListener('click', () => {
          currentPage = page;
          updatePagination(container, wrapper, totalPages, currentPage);
        });

        return li;
      }

      /*
      * Function to update pagination
      */
      function updatePagination(container, wrapper, totalPages) {
        wrapper.innerHTML = '';
        setupPagination(container, totalPages);
        scrapingFLV(container, currentPage, totalPages);
      }

      /*
      * Function for scraping FLV.
      */
      function scrapingFLV(container, page, totalPages) {
        const data = `info=scraping-flv&page=${encodeURIComponent(page)}&device=desktop`;
        fetchRequest('../includes/download-station.php', data, function (err, responseData) {
          if (err) {
            console.log('Error:', err);
            return;
          }

          const wrapper = container.querySelector('.row');
          addAnime(responseData.scraping, wrapper);

          const inputAnime = container.querySelector('#search-form #searchAnime');
          initializeSearchListener(inputAnime, container, wrapper, totalPages);

          wrapper.addEventListener('click', function (e) {
            const selected = wrapper.querySelectorAll('.anime.selected');

            if (selected.length === 0) {
              const clickedAnime = e.target.closest('.anime');
              if (clickedAnime && !clickedAnime.classList.contains('active')) {
                clickedAnime.classList.add('active', 'selected');
                const imageContainer = clickedAnime.querySelector('.image');
                if (imageContainer) {
                  addOverlay(imageContainer);
                  handleAnimeClick(clickedAnime, imageContainer, container);
                }
              }
            }
          });
        });
      }

      // Function for the keyup event
      let isSearchCleared = false;
      let typingTimer;
      const typingDelay = 1000;
      function initializeSearchListener(inputAnime, container, wrapper, totalPages) {
        inputAnime.removeEventListener('keyup', handleSearch);
        inputAnime.addEventListener('keyup', handleSearch);

        function handleSearch() {
          const inputValue = inputAnime.value.trim();
          clearTimeout(typingTimer);

          typingTimer = setTimeout(() => {
            if (inputValue.length === 0) {
              if (!isSearchCleared) {
                clearWrapperExceptForm(wrapper);
                createPagination(container, totalPages);
                scrapingFLV(container, currentPage, totalPages);
                isSearchCleared = true;
              }
            } else if (inputValue.length > 3) {
              scrapingSearch(inputValue, wrapper);
              isSearchCleared = false;
            }
          }, typingDelay);
        }
      }

      /*
      * Function to clear the contents of the wrapper, while maintaining the form.
      */
      function clearWrapperExceptForm(wrapper) {
        const form = wrapper.querySelector('#search-form');
        wrapper.innerHTML = '';
        if (form) {
            wrapper.appendChild(form);
        }
      }

      /*
      * Function for scraping search.
      */
      function scrapingSearch(value, wrapper) {
        const params = `info=scraping-search&value=${encodeURIComponent(value)}&device=desktop`;
        fetchRequest('../includes/download-station.php', params, (err, responseData) => {
          if (err) {
            console.log('Error in scrapingSearch:', err);
            return;
          }

          wrapper.innerHTML = '';
          addAnime(responseData.anime, wrapper);
        });
      }

      /*
      * Function for remove span.
      */
      function removeSpan(name, selector, overlay) {
        name = overlay.querySelectorAll('span' + selector);
        name.forEach(span => {
          span.remove();
        });
      }

      /*
      * Function for event click.
      */
      function handleAnimeClick(clickedAnime, imageContainer, container) {
        const overlay = imageContainer.querySelector('.overlay');
        createSpan('gettingSpan', 'getting-episodes', 'Getting episodes', overlay);
        const url = 'https://www3.animeflv.net' + clickedAnime.getAttribute('data-url');
        scrapingAnime(url, container);
      }

      /*
      * Function for create span.
      */
      function createSpan(name, spanClass, text, container) {
        setTimeout(() => {
          name = document.createElement('span');

          if (spanClass == 'waiting') {
            name.classList.add(spanClass, 'fade');
          }else{
            name.classList.add(spanClass);
          }

          name.textContent = text;
          container.appendChild(name);

          setTimeout(() => name.classList.add('show'), 50);
        }, 500);
      }


      /*
      * Function for adding search to markup.
      */
      function addSearch(container) {
        const containerFluid = container.querySelector('.container-fluid');
        const buttonScraping = container.querySelector('#initScraping');

        if (!document.getElementById('search-form')) {
          const searchForm = document.createElement('form');
          searchForm.setAttribute('id', 'search-form');
          containerFluid.insertBefore(searchForm, buttonScraping.nextSibling);

          const label = document.createElement('label');
          label.setAttribute('for', 'searchAnime');
          label.classList.add('form-label');
          label.textContent = 'Search';
          searchForm.appendChild(label);

          const input = document.createElement('input');
          input.setAttribute('type', 'text');
          input.setAttribute('class', 'form-control');
          input.setAttribute('id', 'searchAnime');
          input.setAttribute('placeholder', 'Search Anime');
          searchForm.appendChild(input);
        }
      }

      /*
      * Function for adding overlay to card.
      */
      function addOverlay(imageContainer) {
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        imageContainer.appendChild(overlay);
      }

      /*
      * Function for adding anime to markup.
      */
      function addAnime(animeList, wrapper) {
        animeList.forEach(anime => {
          const colDiv = document.createElement('div');
          colDiv.classList.add('anime-wrapper', 'col-12', 'col-md-4', 'col-lg-3');

          const animeDiv = document.createElement('div');
          animeDiv.classList.add('anime');
          animeDiv.setAttribute('data-url', anime.link);
          colDiv.appendChild(animeDiv);

          const imageDiv = addImage(anime.url, anime.title, anime.type);
          animeDiv.appendChild(imageDiv);
          const titleDiv = addTitle(anime.title);
          animeDiv.appendChild(titleDiv);

          wrapper.appendChild(colDiv);
        });
      }

      /*
      * Function for adding image to markup.
      */
      function addImage(url, title, type) {
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('image');

        const img = document.createElement('img');
        img.setAttribute('src', url);
        img.setAttribute('alt', title + ' logo');
        imageDiv.appendChild(img);

        const typeSpan = document.createElement('span');
        typeSpan.classList.add('type');
        typeSpan.textContent = type;
        imageDiv.appendChild(typeSpan);

        return imageDiv;
      }

      /*
      * Function for adding title to markup.
      */
      function addTitle(title) {
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('text', 'text-center');

        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        titleDiv.appendChild(titleSpan);

        return titleDiv;
      }

      /*
      * Function for scraping anime.
      */
      var countEpisodes = 0;
      function scrapingAnime(scrapeUrl, container) {
        const url = 'http://localhost:3000/scrape/anime';

        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: scrapeUrl })
        })
        .then(response => response.ok ? response.json() : Promise.reject('Fetch failed'))
        .then(result => {
          const totalEpisodes = result.data.length;
          var offCanvas = document.getElementById('offcanvasBottom');
          showCanvas(offCanvas, result.data[0].title);

          const list = offCanvas.querySelector('.list-group');
          list.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
              var href = e.target.href;
              var episode = e.target.textContent;
              var title = e.target.title;

              downloadEpisode(href, episode, title);
            }
          });

          result.data.forEach((episode, index) => {
            scrapingEpisode(episode.link, episode.title, episode.episode, offCanvas, totalEpisodes, index, container);
          });
        })
        .catch(error => console.error('Fetch error:', error));
      }

      function showCanvas(offCanvas, titleText) {
        var title = offCanvas.querySelector('.offcanvas-title');
        title.textContent = titleText;

        var list = offCanvas.querySelector('.offcanvas-body .list-group');
        if (list) {
          list.innerHTML = '';
        }

        var bsOffcanvas = new bootstrap.Offcanvas(offCanvas);
        bsOffcanvas.show();
      }

      /*
      * Function for scraping episodes.
      */
      function scrapingEpisode(url, title, episode, offCanvas, totalEpisodes, index, container) {
        const data = `info=scraping-episode&url=${encodeURIComponent(url)}&device=desktop`;
        fetchRequest('../includes/download-station.php', data, (err, responseData) => {
          if (err) {
            console.log('Error fetching episode data:', err);
            return;
          }

          const list = offCanvas.querySelector('.offcanvas-body .list-group');
          scrapingStreamtape(responseData.episode.link, title, episode, offCanvas, totalEpisodes, index, list, container);
        });
      }

      /*
      * Function for remove select.
      */
      function removeSelect(container) {
        const selected = container.querySelector('.anime.selected');
        if (selected) {
          selected.classList.remove('selected', 'active');
          countEpisodes = 0;

          const overlay = selected.querySelector('.overlay');
          overlay.parentNode.removeChild(overlay);
        }
      }

      /*
      * Function for add Li to list Group.
      */
      function addLitoListGroup(list, message, index, color, url, title) {
        const newListItem = document.createElement('li');
        newListItem.className = 'list-group-item item-' + index + '';

        if (color) {
          newListItem.classList.add(color);
        }

        if (url == '') {
          newListItem.textContent = message;
          list.appendChild(newListItem);
        }
        else {
          const fileName = title + ' - ' + message;
          const downloadUrl = `/includes/download-file.php?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName)}`;

          const anchor = document.createElement('a');
          anchor.classList.add('download-link');
          anchor.textContent = message;
          anchor.href = downloadUrl;
          anchor.target = '_blank';

          newListItem.appendChild(anchor);
          list.appendChild(newListItem);
        }
      }

      /*
      * Function for scraping download link.
      */
      function scrapingStreamtape(scrapeUrl, title, episode, offCanvas, totalEpisodes, index, list, container) {
        const url = 'http://localhost:3000/scrape/streamtape';
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: scrapeUrl })
        })
        .then(response => {
          if (!response.ok) {
            if (response.status === 400) {
              const errorMessage = 'page is unreachable.';
              addLitoListGroup(list, `${episode} Error: ${errorMessage}`, index, 'text-danger');

              countEpisodes++;
              if (totalEpisodes === countEpisodes) {
                removeSelect(container);
              }

              return Promise.reject('Page is unreachable');
            }

            return Promise.reject(new Error('Bad Request'));
          }

          return response.json();
        })
        .then(result => {
          if (result && result.data && result.data[0]?.status === true) {
            const url = 'https:' + result.data[0].src;
            addLitoListGroup(list, episode, index, '', url, title);

            countEpisodes++;
            if (totalEpisodes === countEpisodes) {
              removeSelect(container);
            }
          } else {
            const errorMessage = result?.data?.[0]?.message || 'No video found.';
            addLitoListGroup(list, `${episode} ${errorMessage}`, index, 'text-danger');

            countEpisodes++;
            if (totalEpisodes === countEpisodes) {
              removeSelect(container);
            }
          }
        })
        .catch(error => {
          if (error !== 'Page is unreachable' && error.message !== 'Bad Request') {
            const errorMessage = error.message || 'Unexpected error occurred.';
            addLitoListGroup(list, `${episode} Error: ${errorMessage}`, index, 'text-danger');

            countEpisodes++;
            if (totalEpisodes === countEpisodes) {
              removeSelect(container);
            }
          }
        });
      }

      /*
      * Function for scraping episodes.
      */
      function downloadEpisode(url, episode, title) {
        const data = `info=download-episode&url=${encodeURIComponent(url)}&episode=${encodeURIComponent(episode)}&title=${encodeURIComponent(title)}&device=desktop`;
        fetchRequest('../includes/download-station.php', data, (err, responseData) => {
          if (err) {
            console.log('Error fetching episode data:', err);
            return;
          }

          console.log(responseData);
        });
      }
    }
  });
})(jQuery);