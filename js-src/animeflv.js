(function ($) {
  window.animeflv = {};

  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('animeflv.php')) {
      const container = document.querySelector('#animeflv');

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

      /*
       * Function for insert container.
       */
      window.animeflv.insertContainer = function(button, container) {
        const animeWrapper = button.closest('.anime-wrapper');
        let animeID = button.closest('.anime').getAttribute('id');
        const animeContainer = container.querySelector('.anime-container .row');
        const allAnimeWrappers = [...container.querySelectorAll('.anime-wrapper')];
        const index = allAnimeWrappers.indexOf(animeWrapper);
        const itemsPerGroup = getItemsPerGroup();

        const insertIndex = Math.ceil((index + 1) / itemsPerGroup) * itemsPerGroup;

        document.querySelectorAll(".anime-detail").forEach(el => el.remove());

        const extraContainer = document.createElement('div');
        extraContainer.classList.add('anime-detail', 'col-12');
        extraContainer.setAttribute('data-anime-id', animeID);
        extraContainer.textContent = 'Extra Container';

        if (insertIndex < allAnimeWrappers.length) {
          animeContainer.insertBefore(extraContainer, allAnimeWrappers[insertIndex], { preventScroll: true });
        } else {
          animeContainer.appendChild(extraContainer);
        }

        // Trigger animation after insert
        requestAnimationFrame(() => {
          extraContainer.classList.add('show');
        });

        fetch(`../includes/animeflv/anime-data.php?anime_id=${animeID}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            extraContainer.textContent = 'Error loading information.';
            return;
          }

          const genres = data.genres ? (typeof data.genres === 'string' ? data.genres.split(',') : data.genres) : [];

          extraContainer.innerHTML = `
            <div class="anime">
              <div class="image">
                <img src="${data.image_url}" alt="${data.title}">
              </div>
              <div class="text">
                <h2>${data.title}</h2>
                <p>${data.synopsis}</p>
                <div class="genres">
                    ${genres.map(genre => `<span class="genre">${genre}</span>`).join('')}
                </div>
                <ul class="nav nav-tabs" id="animeflvTabs" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="desktop-tab" data-bs-toggle="tab" data-bs-target="#desktop-tab-pane" type="button" role="tab" aria-controls="desktop-tab-pane" aria-selected="true">Desktop</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="synology-tab" data-bs-toggle="tab" data-bs-target="#synology-tab-pane" type="button" role="tab" aria-controls="synology-tab-pane" aria-selected="false">Synology</button>
                  </li>
                </ul>
                <div class="tab-content" id="animeflvTabContent">
                  <div class="tab-pane fade show active" id="desktop-tab-pane" role="tabpanel" aria-labelledby="desktop-tab" tabindex="0">
                    <ul class="list-group list-group-flush">
                      ${data.episodes.map(ch => `<li class="list-group-item"><a class="download-desktop" href="${ch.link}" target="_blank">Episode ${ch.episode_number}</a></li>`).join('')}
                    </ul>
                  </div>
                  <div class="tab-pane fade" id="synology-tab-pane" role="tabpanel" aria-labelledby="synology-tab" tabindex="0">
                    ${window.loginForm}
                  </div>
                </div>
              </div>
            </div>
          `;

          container.querySelectorAll('.download-desktop').forEach(button => {
            button.addEventListener('click', function(e) {
              e.preventDefault();
              const url = this.getAttribute('href');
              const episode = this.textContent;
              const item = this.closest('.list-group-item').classList[1];
              const title = this.closest('.text').querySelector('h2').textContent;
              scrapingStreamtape(url, title, episode, item, 'desktop');
            });
          });

          if (window.loginForm === '') {
            getPath().then(status => {
              pathStatus = status;
              
              if (!pathStatus) {
                const synologyTab = container.querySelector('#synology-tab-pane');
                const paragraph = document.createElement('p');
                paragraph.innerHTML = 'You need to create anime shared folder in your Synology NAS and reload the page. <a href="#" class="reload-page">Click here to reload the page</a>.';

                paragraph.querySelector('.reload-page').addEventListener('click', function(e) {
                  e.preventDefault();
                  window.location.reload();
                });

                synologyTab.appendChild(paragraph);
              }
              else{
                const item = container.querySelectorAll('#desktop-tab-pane ul li');

                let url = '&title=' + encodeURIComponent(data.title);
                item.forEach(element => {
                  url += '&episodes[]=' + encodeURIComponent(element.querySelector('a').textContent);
                });

                validateEpisodes(url, data.episodes, container);
              }
            });
          }
        })
        .catch(error => {
          console.error('Error al obtener datos:', error);
          extraContainer.textContent = 'No se pudo cargar la información.';
        });
      }

      /*
        * Function for get items for breakpoints.
        */
      function getItemsPerGroup() {
        if (window.innerWidth < 768) {  
          return 2;
        } else if (window.innerWidth < 1440) {  
          return 3;
        } else {  
          return 4;
        }
      }

      /*
      * Function for get shared folders.
      */
      async function getPath() {
        try {
          const response = await fetch(`../includes/synology.php?info=get-path`);
          const data = await response.json();
          
          if (data.error) {
            console.log(data.error);
            return false;
          }

          return data.folder.some(element => element.path === 'anime');
        } catch (error) {
          console.error("Error getting data:", error);
          return false;
        }
      }

      /*
          * Function for validated if episodes exist.
          */
      function validateEpisodes(url, episodes, container) {
        fetch(`../includes/synology.php?info=verify-episodes${url}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.log(data.error);
            return;
          }

          var status = false;
          var episodesArray = [];

          episodes.forEach(episode => { 
            var filteredEpisodes = data.verify.filter(ep => ep.episode === 'Episode ' + episode.episode_number);

            if (filteredEpisodes.length !== 0) {
              status = filteredEpisodes[0].status;

              episodesArray.push({
                episode: episode.episode_number,
                link: episode.link,
                status: status
              });
            }
            else {
              episodesArray.push({
                episode: episode.episode_number,
                link: episode.link,
                status: 'false'
              });
            }
          });

          const synology = container.querySelector('#synology-tab-pane');
          const list = document.createElement('ul');
          list.classList.add('list-group', 'list-group-flush');

          episodesArray.forEach(episode => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'item-'+ episode.episode);

            if (episode.status === 'false') {
              const anchor = document.createElement('a');
              anchor.classList.add('download-synology');
              anchor.textContent = 'Episode ' + episode.episode;
              anchor.href = episode.link;

              listItem.appendChild(anchor);              
            }
            else {
              const span = document.createElement('span');
              span.classList.add('text-white');
              span.dataset.bsToggle = 'tooltip';
              span.dataset.bsPlacement = 'top';
              span.setAttribute('title', 'Episode already downloaded');
              span.textContent = 'Episode ' + episode.episode;

              listItem.appendChild(span);
            }

            list.appendChild(listItem);
          });

          synology.appendChild(list);

          container.querySelectorAll('.download-synology').forEach(button => {
            button.addEventListener('click', function(e) {
              e.preventDefault();
              const url = this.getAttribute('href');
              const episode = this.textContent;
              const item = this.closest('.list-group-item').classList[1];
              const title = this.closest('.text').querySelector('h2').textContent;
              scrapingStreamtape(url, title, episode, item, 'synology');
            });
          });

        })
        .catch(error => {
          console.error("Error getting data:", error);
        });
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
       * Function for scraping download link.
       */
      function scrapingStreamtape(scrapeUrl, title, episode, item, type) {
        const overlay = document.querySelector('.loader-overlay');
        overlay.classList.remove('visually-hidden');

        fetch('../includes/animeflv/streamtape.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `url=${encodeURIComponent(scrapeUrl)}`
        })
        .then(response => {
          if (!response.ok) {
            if (response.status === 404) {
              overlay.classList.add('visually-hidden');
              const toast = document.querySelector('.toast');
              const toastBody = toast.querySelector('.toast-body');
              toastBody.textContent = 'Sorry, the video is unreachable.';

              const toastOptions = {
                animation: true,
                autohide: true,
                delay: 3000
              };

              const bsToast = bootstrap.Toast.getOrCreateInstance(toast, toastOptions);
              bsToast.show();
            }
            return Promise.reject(new Error(response.status === 400 ? 'Page is unreachable' : 'Bad Request'));
          }
          return response.json();
        })
        .then(result => {
          if (result && result.data && result.data.status === true) {
            if (type === 'desktop') {
              const url = `/includes/download-file.php?url=${encodeURIComponent("https:" + result.data.src)}&filename=${encodeURIComponent(title + " - "  + episode + ".mp4")}`;
              overlay.classList.add('visually-hidden');
              window.open(url, '_blank');
            } else {
              sendURL("https:" + result.data.src, title, episode, result.data.title, item, overlay, type);
            }
          } else {
            console.log('Download link not found.');
          }
        })
        .catch(error => {
          if (error.message !== 'Page is unreachable' && error.message !== 'Bad Request') {
            console.log('Error in scrapingStreamtape:', error);
          }
        });
      }

      /*
       * Function for send the download url.
       */
      function sendURL(url, title, episode, name, item, overlay, type) {
        const params = `info=download-station&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&episode=${encodeURIComponent(episode)}`;
        fetchRequest('../includes/synology.php', params, (err, responseData) => {
          if (err) {
            console.log('Error in sendURL:', err);
            return;
          }

          if (responseData.download.error) {
            return;
          }

          idDownload(name, episode, title, item, overlay, type);
        });
      }

      /*
       * Function for get the download information.
       */
      function idDownload(name, episode, title, item, overlay, type) {
        const intervalDownload = setInterval(() => {
          const params = `info=id-download&name=${encodeURIComponent(name)}`;
          fetchRequest('../includes/synology.php', params, (err, responseData) => {
            if (err) {
              console.log('Error in idDownload:', err);
              return;
            }

            if (responseData.id.download == 'downloading') {
              const id = responseData.id.id;
              clearInterval(intervalDownload);
              infoDownload(id, episode, title, name, item, overlay, type);
            }
          });
        }, 1000);
      }

      /*
      * Function for start to download.
      */
      function infoDownload(id, episode, title, name, item, overlay, type) {
        const intervalInfo = setInterval(() => {
          const params = `info=info-download&id=${encodeURIComponent(id)}`;
          fetchRequest('../includes/synology.php', params, (err, responseData) => {
            if (err) {
              console.log('Error in infoDownload:', err);
              return;
            }

            if (responseData.info.status === 'error') {
              clearInterval(intervalInfo);
              return;
            }

            var progress = (responseData.info.download / responseData.info.size) * 100;
            progress = Math.round(progress);

            if (responseData.info.status !== 'finished' && responseData.info.status !== 'completed') {
              if (responseData.info.size > 0) {
                const progressDiv = document.querySelector(`.progress.${id}`);
                if (!progressDiv) {
                  if (type === 'synology') {
                    overlay.classList.add('visually-hidden');
                  }

                  createProgressBar(id, progress, item);
                } else {
                  const progressBar = document.querySelector(`.progress.${id} .progress-bar`);
                  progressBar.style.width = progress + '%';
                  progressBar.textContent = progress + '%';

                  const progressContainer = progressBar.parentElement;
                  progressContainer.setAttribute('aria-valuenow', progress);
                }
              }
            } else {
              const progressBar = document.querySelector(`.progress.${id} .progress-bar`);
              progressBar.style.width = '100%';
              progressBar.textContent = '100%';

              const progressContainer = progressBar.parentElement;
              progressContainer.setAttribute('aria-valuenow', progress);

              renameFile(title, name, episode);
              clearInterval(intervalInfo);

              const list = document.querySelector('.list-group-item.' + item);
              const downloadLink = list.querySelector('.download-synology');
              const span = document.createElement('span');
              span.classList.add('text-white');
              span.dataset.bsToggle = 'tooltip';
              span.dataset.bsPlacement = 'top';
              span.setAttribute('title', 'Episode already downloaded');
              span.textContent = episode;

              list.replaceChild(span, downloadLink);
            }
          });
        }, 1000);
      }
      
      /*
       * Function for rename file.
       */
      function renameFile(title, name, episode) {
        const params = `info=rename-file&title=${encodeURIComponent(title)}&name=${encodeURIComponent(name)}&episode=${encodeURIComponent(episode)}`;
        fetchRequest('../includes/synology.php', params, (err, responseData) => {
          if (err) {
            console.log('Error in renameFile:', err);
            return;
          }
        });
      }

      /*
       * Function for add progress bar to canvas.
       */
      function createProgressBar(id, progress, item) {
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

          const list = document.querySelector('.list-group-item.' + item)
          list.appendChild(progressContainer);
        }, 500);
      }
    }
  });
})(jQuery);