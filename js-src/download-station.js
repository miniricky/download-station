(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/') {
      const sessionCookie = getCookie('sid');

      if (sessionCookie) {
        const element = document.querySelector('body');
        element.classList.remove('visually-hidden');
      } else {
        window.location.href = 'login.html';
      }

      /*
       * Function for get cookie.
       */
      function getCookie(name) {
        const cookies = document.cookie.split(';').map(cookie => cookie.trim());
        const foundCookie = cookies.find(cookie => cookie.startsWith(name + '='));
        return foundCookie ? foundCookie.substring((name + '=').length) : null;
      }

      const container = document.querySelector('#download-station');

      /*
      * Function for get shared folders.
      */
      get_Path(container)
      function get_Path(container) {
        const params = `info=get-path`;
        fetchRequest('../includes/download-station.php', params, (err, responseData) => {
          if (err) {
            console.log('Error in getPath:', err);
            return;
          }

          if (responseData.folder.error) {
            showToast(responseData.verify.error)
          }
          else {
            const select = container.querySelector('.folder-select');

            responseData.folder.forEach(folder => {
              const newOption = document.createElement('option');
              newOption.value = folder.path;
              newOption.textContent = capFirst(folder.path);
              select.appendChild(newOption);
            });
          }
        });
      }

      let unique = 0;
      const scraping = container.querySelector('#initScraping');
      scraping.addEventListener('click', function () {
        const folder = document.querySelector('.folder-select');
        const selectedValue = folder.value;

        if (unique === 0 && selectedValue != 'Select a folder') {
          //unique++;
          scrapingPagination(container);
        }
        else{
          showToast('You must add a folder')
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
        const data = `info=scraping-pagination`;
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
        const data = `info=scraping-flv&page=${encodeURIComponent(page)}`;
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
        const params = `info=scraping-search&value=${encodeURIComponent(value)}`;
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
        verifyPackage(url, container);
      }

      /*
      * Function for verify if download station is installed.
      */
      function verifyPackage(url, container) {
        const params = 'info=verify-package';
        fetchRequest('../includes/download-station.php', params, (err, responseData) => {
          if (err) {
            console.log('Error in verifyPackage:', err);
            return;
          }

          var status = false;
          responseData.verify.forEach(package => {
            if (package.id === 'DownloadStation') {
              status = true;
            }
          });

          if (status) {
            scrapingAnime(url, container);
          } else{
            showToast('Download Station is not installed');
          }
        });
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
        const url = 'http://localhost:3000/scrape';

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
        const data = `info=scraping-episode&url=${encodeURIComponent(url)}`;
        fetchRequest('../includes/download-station.php', data, (err, responseData) => {
          if (err) {
            console.log('Error fetching episode data:', err);
            return;
          }

          varifyEpisode(responseData.episode.link, title, episode, offCanvas, totalEpisodes, index, container);
        });
      }

      /*
      * Function for verify if exist the episo on file station.
      */
      function varifyEpisode(link, title, episode, offCanvas, totalEpisodes, index, container) {
        const folderSelect = document.querySelector('.folder-select');
        const folder = folderSelect.value;

        const data = `info=verify-episode&folder=${encodeURIComponent(folder)}&title=${encodeURIComponent(title)}&episode=${encodeURIComponent(episode)}`;
        fetchRequest('../includes/download-station.php', data, (err, responseData) => {
          if (err) {
            console.log('Error fetching episode verification:', err);
            return;
          }

          const list = offCanvas.querySelector('.offcanvas-body .list-group');
          if (responseData.verify.status === 'true') {
            addLitoListGroup(list, responseData.verify.message, index)

            countEpisodes++;
            if (totalEpisodes == countEpisodes) {
              removeSelect(container);
            }
          } else {
            scrapingSreamtape(link, folder, title, episode, offCanvas, totalEpisodes, index, list, container);
          }
        });
      }

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
      function addLitoListGroup(list, message, index) {
        const newListItem = document.createElement('li');
        newListItem.className = 'list-group-item item-' + index;
        newListItem.textContent = message;
        list.appendChild(newListItem);
      }

      /*
      * Function for scraping download link.
      */
      function scrapingSreamtape(scrapeUrl, folder, title, episode, offCanvas, totalEpisodes, index, list, container) {
        const url = 'http://localhost:4000/scrape';
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: scrapeUrl })
        })
        .then(response => response.ok ? response.json() : Promise.reject('Fetch failed'))
        .then(result => {
          if (result.data[0].status === true) {
            const url = 'https:' + result.data[0].src;
            const encodedUrl = encodeURIComponent(url);
            sendURL(encodedUrl, folder, title, episode, offCanvas, result.data[0].title, totalEpisodes, index, list, container);
          } else{
            addLitoListGroup(list, episode + ' ' + result.data[0].message, index)

            countEpisodes++;
            if (totalEpisodes == countEpisodes) {
              removeSelect(container)
            }
          }
        })
        .catch(error => console.error('Fetch error:', error));
      }

      /*
      * Function for send the download url.
      */
      function sendURL(url, folder, title, episode, offCanvas, name, totalEpisodes, index, list, container) {
        const params = `info=download-station&url=${encodeURIComponent(url)}&folder=${encodeURIComponent(folder)}&title=${encodeURIComponent(title)}&episode=${encodeURIComponent(episode)}`;
        fetchRequest('../includes/download-station.php', params, (err, responseData) => {
          if (err) {
            console.log('Error in sendURL:', err);
            return;
          }

          if (responseData.download.error) {
            console.log(responseData);
            return;
          }

          addLitoListGroup(list, responseData.download.message, index)
          idDownload(name, offCanvas, episode, folder, title, totalEpisodes, list, index, container);
        });
      }

      /*
      * Function for get the download information.
      */
      let waiting = 0;
      function idDownload(name, offCanvas, episode, folder, title, totalEpisodes, list, index, container) {
        const intervalDownload = setInterval(() => {
          const params = `info=id-download&name=${encodeURIComponent(name)}`;
          fetchRequest('../includes/download-station.php', params, (err, responseData) => {
            if (err) {
              console.log('Error in idDownload:', err);
              return;
            }

            if (responseData.id.download === 'waiting') {
              if (waiting === 0) {

              }
            }

            if (responseData.id.download === 'downloading') {
              const id = responseData.id.id;
              clearInterval(intervalDownload);
              infoDownload(id, episode, offCanvas, folder, title, name, totalEpisodes, list, index, container);
            }
          });
        }, 5000);
      }

      /*
      * Function for capitalize the first letter.
      */
      function capFirst(str) {
        return str[0].toUpperCase() + str.slice(1);
      }

      /*
      * Function for start to download.
      */
      function infoDownload(id, episode, offCanvas, folder, title, name, totalEpisodes, list, index, container) {
        const intervalInfo = setInterval(() => {
          const params = `info=info-download&id=${encodeURIComponent(id)}`;
          fetchRequest('../includes/download-station.php', params, (err, responseData) => {
            if (err) {
              console.log('Error in infoDownload:', err);
              return;
            }

            var progress = (responseData.info.download / responseData.info.size) * 100;
            progress = Math.round(progress);

            if (responseData.info.status === 'error') {
              clearInterval(intervalInfo);

              countEpisodes++;
              if (totalEpisodes === countEpisodes) {
                removeSelect(container)
              }
            }

            if (responseData.info.status !== 'finished') {
              if (responseData.info.size > 0) {
                const progressDiv = offCanvas.querySelector(`.progress.${id}`);
                if (!progressDiv) {
                  createProgressBar(id, progress, list, index);
                } else {
                  const progressBar = offCanvas.querySelector(`.progress.${id} .progress-bar`);
                  progressBar.style.width = progress + '%';
                  progressBar.textContent = progress + '%';

                  const progressContainer = progressBar.parentElement;
                  progressContainer.setAttribute('aria-valuenow', progress);
                }
              }
            } else {
              const progressBar = offCanvas.querySelector(`.progress.${id} .progress-bar`);
              progressBar.style.width = '100%';
              progressBar.textContent = '100%';

              const progressContainer = progressBar.parentElement;
              progressContainer.setAttribute('aria-valuenow', progress);

              renameFile(folder, title, name, episode, totalEpisodes, container);
              clearInterval(intervalInfo);
            }
          });
        }, 5000);
      }

      /*
      * Function for add progress bar to canvas.
      */
      function createProgressBar(id, progress, list, index) {
        setTimeout(() => {
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

          const referenceNode = list.querySelector('.item-' + index)
          list.insertBefore(progressContainer, referenceNode.nextSibling);
        }, 500);
      }

      /*
      * Function for rename file.
      */
      function renameFile(folder, title, name, episode, totalEpisodes, container) {
        const params = `info=rename-file&folder=${encodeURIComponent(folder)}&title=${encodeURIComponent(title)}&name=${encodeURIComponent(name)}&episode=${encodeURIComponent(episode)}`;
        fetchRequest('../includes/download-station.php', params, (err, responseData) => {
          if (err) {
            console.log('Error in renameFile:', err);
            return;
          }

          countEpisodes++;
          if (totalEpisodes == countEpisodes) {
            removeSelect(container)
          }
        });
      }
    }
  });
})(jQuery);