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
            extraContainer.textContent = 'Error al cargar la información.';
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
                    <div class="scrollspy-wrapper d-flex ${data.episodes.length > 105 ? ' flex-column gap-1' : ' gap-4'}">
                      <div class="episode-wrapper">
                        <div data-bs-spy="scroll" data-bs-target="#episode-list" data-bs-smooth-scroll="true" class="scrollspy-animeflv">
                          ${Array.from({ length: Math.ceil(data.episodes.length / 7) }, (_, i) => {
                            const groupEpisodes = data.episodes.slice(i * 7, (i + 1) * 7);
                            return `
                              <div id="episode-group-${i + 1}" class="h-100">
                                <ul class="list-group list-group-flush">
                                  ${groupEpisodes.map(ch => `
                                    <li class="list-group-item">
                                      <a class="download-desktop" href="${ch.link}" target="_blank">Episodio ${ch.episode_number}</a>
                                    </li>
                                  `).join('')}
                                </ul>
                              </div>
                            `;
                          }).join('')}
                        </div>
                      </div>
                    
                      ${data.episodes.length > 7 ? `
                        <div class="dot-wrapper">
                          <div id="episode-list" class="list-group ${data.episodes.length > 105 ? 'episode-column d-flex flex-row flex-wrap' : ''}">
                            ${Array.from({ length: Math.ceil(data.episodes.length / 7) }, (_, i) => {
                              const start = i * 7 + 1;
                              const end = Math.min((i + 1) * 7, data.episodes.length);
                              return `
                                <a class="list-group-item list-group-item-action custom-tooltip" href="#episode-group-${i + 1}" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-custom-class="custom-tooltip" data-bs-title="Episodios del ${start} - ${end}">
                                  Episodios ${start}-${end}
                                </a>
                              `;
                            }).join('')}
                          </div>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                  <div class="tab-pane fade" id="synology-tab-pane" role="tabpanel" aria-labelledby="synology-tab" tabindex="0">
                    ${window.loginForm}
                  </div>
                </div>
                ${data.calendar ? `<p><small>Siguiente capítulo el ${new Date(data.calendar).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</small></p>` : ''}
              </div>
            </div>
          `;

          // Initialize ScrollSpy and tooltips after transition
          extraContainer.addEventListener('transitionend', () => {
            // Initialize ScrollSpy
            const desktopTab = container.querySelector('#desktop-tab-pane');
            const desktopScrollSpyEl = desktopTab.querySelector('[data-bs-spy="scroll"]');
            bootstrap.ScrollSpy.getOrCreateInstance(desktopScrollSpyEl);
            desktopScrollSpyEl.addEventListener('activate.bs.scrollspy', (event) => {
              const activeLink = event.relatedTarget;
              if (activeLink) {
                activeLink.classList.add('active');
              }
            });

            // Initialize tooltips
            const tooltipTriggerList = container.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
              const episodeList = document.querySelector('#episode-list');
              const hasEpisodeColumn = episodeList && episodeList.classList.contains('episode-column');
              
              const tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
                trigger: 'manual',
                boundary: 'window',
                placement: hasEpisodeColumn ? 'bottom' : 'right',
                popperConfig: hasEpisodeColumn ? {
                  modifiers: [
                    {
                      name: 'computeStyles',
                      options: {
                        adaptive: false
                      }
                    },
                    {
                      name: 'preventOverflow',
                      options: {
                        boundary: 'window'
                      }
                    },
                    {
                      name: 'applyStyles',
                      fn: ({ state }) => {
                        if (state.elements.popper) {
                          const episodeList = document.querySelector('#episode-list');
                          if (episodeList && episodeList.classList.contains('episode-column')) {
                            const rect = episodeList.getBoundingClientRect();
                            const targetRect = state.elements.reference.getBoundingClientRect();
                            
                            Object.assign(state.elements.popper.style, {
                              position: 'fixed',
                              top: `${rect.bottom}px`,
                              left: `${rect.right - state.elements.popper.offsetWidth}px`,
                              transform: 'none'
                            });
                          }
                        }
                      }
                    }
                  ]
                } : null
              });

              // Show tooltip if initially active
              if (tooltipTriggerEl.classList.contains('active')) {
                tooltip.show();
              }

              // Handle class changes
              const observer = new MutationObserver(() => {
                const isActive = tooltipTriggerEl.classList.contains('active');
                if (isActive && !tooltip._isShown()) {
                  tooltip.show();
                } else if (!isActive && tooltip._isShown()) {
                  tooltip.hide();
                }
              });

              observer.observe(tooltipTriggerEl, { 
                attributes: true,
                attributeFilter: ['class']
              });

              return tooltip;
            });
          }, { once: true });

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
                paragraph.innerHTML = 'Debe crear una carpeta compartida de anime en su Synology NAS y volver a cargar la página. <a href="#" class="reload-page">Haga clic aquí para recargar la página</a>.';

                paragraph.querySelector('.reload-page').addEventListener('click', function(e) {
                  e.preventDefault();
                  window.location.reload();
                });

                synologyTab.appendChild(paragraph);
              }
              else{
                if (data.episodes && data.episodes.length > 0) {
                  // Remove url parameter since we're not using it
                  validateEpisodes(data.episodes, container);
                } else {
                  const synologyTab = container.querySelector('#synology-tab-pane');
                  synologyTab.innerHTML = '<p>No hay episodios disponibles para este anime.</p>';
                  const desktopTab = container.querySelector('#desktop-tab-pane');
                  desktopTab.innerHTML = '<p>No hay episodios disponibles para este anime.</p>';
                }
              }
            });
          }
        })
        .catch(error => {
          console.error('Error getting data:', error);
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
      function validateEpisodes(episodes, container) {
        const batchSize = 100;
        const allEpisodesArray = [];
        
        // Process episodes in batches
        const processBatch = async (startIndex) => {
          const batchEpisodes = episodes.slice(startIndex, startIndex + batchSize);
          if (batchEpisodes.length === 0) {
            return;
          }

          let batchUrl = '&title=' + encodeURIComponent(episodes[0].anime_title || '');
          batchEpisodes.forEach(episode => {
            batchUrl += '&episodes[]=' + encodeURIComponent('Episodio ' + episode.episode_number);
          });

          try {
            const response = await fetch(`../includes/synology.php?info=verify-episodes${batchUrl}`);
            const data = await response.json();
            
            if (data.error) {
              console.log(data.error);
              return;
            }

            batchEpisodes.forEach(episode => {
              const filteredEpisodes = data.verify.filter(ep => ep.episode === 'Episodio ' + episode.episode_number);
              
              allEpisodesArray.push({
                episode: episode.episode_number,
                link: episode.link,
                status: filteredEpisodes.length !== 0 ? filteredEpisodes[0].status : 'false'
              });
            });

            // Process next batch if there are more episodes
            if (startIndex + batchSize < episodes.length) {
              await processBatch(startIndex + batchSize);
            } else {
              // All batches processed, now create the UI
              createSynologyUI(allEpisodesArray, container);
            }
          } catch (error) {
            console.error("Error getting data:", error);
          }
        };

        // Start processing from the first batch
        processBatch(0);
      }

      /*
       * Function for create synology UI.
       */
      function createSynologyUI(episodesArray, container){
        const synology = container.querySelector('#synology-tab-pane');
        const scrollspyWrapper = document.createElement('div');
        scrollspyWrapper.classList.add('scrollspy-wrapper', 'd-flex');
        
        // Fix: Add classes separately
        if (episodesArray.length > 105) {
          scrollspyWrapper.classList.add('flex-column');
          scrollspyWrapper.classList.add('gap-1');
        } else {
          scrollspyWrapper.classList.add('gap-4');
        }

        // Episode wrapper with scrollspy
        const episodeWrapper = document.createElement('div');
        episodeWrapper.classList.add('episode-wrapper');
        
        const scrollspyContent = document.createElement('div');
        scrollspyContent.classList.add('scrollspy-animeflv');
        scrollspyContent.setAttribute('data-bs-spy', 'scroll');
        scrollspyContent.setAttribute('data-bs-target', '#synology-episode-list');
        scrollspyContent.setAttribute('data-bs-smooth-scroll', 'true');

        // Group episodes
        const groupedEpisodes = [];
        for (let i = 0; i < episodesArray.length; i += 7) {
          groupedEpisodes.push(episodesArray.slice(i, i + 7));
        }

        groupedEpisodes.forEach((group, index) => {
          const groupDiv = document.createElement('div');
          groupDiv.id = `synology-episode-group-${index + 1}`;
          groupDiv.classList.add('h-100');

          const list = document.createElement('ul');
          list.classList.add('list-group', 'list-group-flush');

          group.forEach(episode => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'item-' + episode.episode);

            if (episode.status === 'false') {
              const anchor = document.createElement('a');
              anchor.classList.add('download-synology');
              anchor.textContent = 'Episodio ' + episode.episode;
              anchor.href = episode.link;
              listItem.appendChild(anchor);
            } else {
              const span = document.createElement('span');
              span.classList.add('text-white');
              span.dataset.bsToggle = 'tooltip';
              span.dataset.bsPlacement = 'top';
              span.setAttribute('title', 'Episodio ya descargado');
              span.textContent = 'Episodio ' + episode.episode;
              listItem.appendChild(span);
            }

            list.appendChild(listItem);
          });

          groupDiv.appendChild(list);
          scrollspyContent.appendChild(groupDiv);
        });

        episodeWrapper.appendChild(scrollspyContent);
        scrollspyWrapper.appendChild(episodeWrapper);

        // Add dots navigation if more than 7 episodes
        if (episodesArray.length > 7) {
          const dotWrapper = document.createElement('div');
          dotWrapper.classList.add('dot-wrapper');

          const episodeList = document.createElement('div');
          episodeList.id = 'synology-episode-list';
          episodeList.classList.add('list-group');
          if (episodesArray.length > 105) {
            episodeList.classList.add('episode-column', 'd-flex', 'flex-row', 'flex-wrap');
          }

          groupedEpisodes.forEach((_, index) => {
            const start = index * 7 + 1;
            const end = Math.min((index + 1) * 7, episodesArray.length);
            
            const link = document.createElement('a');
            link.classList.add('list-group-item', 'list-group-item-action', 'custom-tooltip');
            link.href = `#synology-episode-group-${index + 1}`;
            link.dataset.bsToggle = 'tooltip';
            link.dataset.bsPlacement = episodesArray.length > 105 ? 'bottom' : 'right';
            link.dataset.bsCustomClass = 'custom-tooltip';
            link.dataset.bsTitle = `Episodios del ${start} - ${end}`;
            link.textContent = `Episodios ${start}-${end}`;

            episodeList.appendChild(link);
          });

          // Initialize tooltips after appending to DOM
          const tooltipTriggerList = episodeList.querySelectorAll('[data-bs-toggle="tooltip"]');
          [...tooltipTriggerList].forEach(tooltipTriggerEl => {
            const tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
              trigger: 'manual',
              boundary: 'window',
              placement: episodesArray.length > 105 ? 'bottom' : 'right',
              popperConfig: episodesArray.length > 105 ? {
                modifiers: [
                  {
                    name: 'computeStyles',
                    options: {
                      adaptive: false
                    }
                  },
                  {
                    name: 'preventOverflow',
                    options: {
                      boundary: 'window'
                    }
                  },
                  {
                    name: 'applyStyles',
                    fn: ({ state }) => {
                      if (state.elements.popper) {
                        const episodeList = document.querySelector('#synology-episode-list');
                        if (episodeList && episodeList.classList.contains('episode-column')) {
                          const rect = episodeList.getBoundingClientRect();
                          Object.assign(state.elements.popper.style, {
                            position: 'fixed',
                            top: `${rect.bottom}px`,
                            left: `${rect.left}px`,
                            transform: 'none'
                          });
                        }
                      }
                    }
                  }
                ]
              } : null
            });

            // Show tooltip if initially active
            if (tooltipTriggerEl.classList.contains('active')) {
              tooltip.show();
            }

            // Handle class changes
            const observer = new MutationObserver(() => {
              const isActive = tooltipTriggerEl.classList.contains('active');
              if (isActive && !tooltip._isShown()) {
                tooltip.show();
              } else if (!isActive && tooltip._isShown()) {
                tooltip.hide();
              }
            });

            observer.observe(tooltipTriggerEl, {
              attributes: true,
              attributeFilter: ['class']
            });
          });

          dotWrapper.appendChild(episodeList);
          scrollspyWrapper.appendChild(dotWrapper);
        }

        synology.appendChild(scrollspyWrapper);

        // Initialize ScrollSpy when tab is shown
        const synologyTab = document.querySelector('#synology-tab');
        synologyTab.addEventListener('shown.bs.tab', () => {
          const synologyScrollSpyEl = synology.querySelector('[data-bs-spy="scroll"]');
          
          if (synologyScrollSpyEl) {
            // Dispose existing instance if any
            const existingScrollSpy = bootstrap.ScrollSpy.getInstance(synologyScrollSpyEl);
            if (existingScrollSpy) {
              existingScrollSpy.dispose();
            }
            
            const scrollSpy = new bootstrap.ScrollSpy(synologyScrollSpyEl, {
              target: '#synology-episode-list'
            });
            
            synologyScrollSpyEl.addEventListener('activate.bs.scrollspy', (event) => {
              const activeLink = event.relatedTarget;
              if (activeLink) {
                activeLink.classList.add('active');
              }
            });
          }
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
              toastBody.textContent = 'Lo sentimos, el video no está disponible.';

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
            console.log('Enlace de descarga no encontrado.');
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
              span.setAttribute('title', 'Episodio ya descargado');
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