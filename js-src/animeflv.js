(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('animeflv.php')) {
      const container = document.querySelector('#animeflv');

      container.querySelectorAll('.viewChapters').forEach(button => {
        button.addEventListener('click', function() {
          insertContainer(this, container);
        });
      });

      /*
        * Function for insert container.
        */
      function insertContainer(button, container) {
        const animeWrapper = button.closest('.anime-wrapper');
        let animeID = button.closest('.anime').getAttribute('id');
        const animeContainer = container.querySelector('.anime-container');
        const allAnimeWrappers = [...container.querySelectorAll('.anime-wrapper')];
        const index = allAnimeWrappers.indexOf(animeWrapper);
        const itemsPerGroup = getItemsPerGroup();

        const insertIndex = Math.ceil((index + 1) / itemsPerGroup) * itemsPerGroup;

        document.querySelectorAll(".anime-detail").forEach(el => el.remove());

        const extraContainer = document.createElement('div');
        extraContainer.classList.add('anime-detail', 'col-12');
        extraContainer.textContent = 'Contenedor Extra';

        if (insertIndex < allAnimeWrappers.length) {
          animeContainer.insertBefore(extraContainer, allAnimeWrappers[insertIndex]);
        } else {
          animeContainer.appendChild(extraContainer);
        }

        fetch(`../includes/animeflv/anime-data.php?anime_id=${animeID}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            extraContainer.textContent = 'Error al cargar la información.';
            return;
          }

          const genres = typeof data.genres === 'string' ? data.genres.split(',') : data.genres;

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
                      ${data.chapters.map(ch => `<li class="list-group-item"><a href="/includes/download-file.php?url=${encodeURIComponent('https:' + ch.link)}&filename=${encodeURIComponent(data.title + ' - episode' + ch.chapter_number + '.mp4')}" target="_blank">Episode ${ch.chapter_number}</a></li>`).join('')}
                    </ul>
                  </div>
                  <div class="tab-pane fade" id="synology-tab-pane" role="tabpanel" aria-labelledby="synology-tab" tabindex="0">
                    ${window.loginForm}
                  </div>
                </div>
              </div>
            </div>
          `;

          if (window.loginForm === '') {
            getPath().then(status => {
              pathStatus = status;
              
              if (!pathStatus) {
                const synologyTab = container.querySelector('#synology-tab-pane');
                const paragraph = document.createElement('p');
                paragraph.textContent = 'You need to create anime shared folder in your Synology NAS';
                synologyTab.appendChild(paragraph);
              }
              else{
                const item = container.querySelectorAll('#desktop-tab-pane ul li');

                let url = '&title=' + encodeURIComponent(data.title);
                item.forEach(element => {
                  url += '&episodes[]=' + encodeURIComponent(element.querySelector('a').textContent);
                });

                validateEpisodes(url, data.chapters, container);
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
        } else if (window.innerWidth < 1200) {  
          return 4;
        } else {  
          return 6;
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
      function validateEpisodes(url, charapters, container) {
        fetch(`../includes/synology.php?info=verify-episodes${url}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.log(data.error);
            return;
          }

          var status = false;
          var episodes = [];

          charapters.forEach(charapter => { 
            var filteredCharapter = data.verify.filter(ep => ep.episode === 'Episode ' + charapter.chapter_number);

            if (filteredCharapter.length !== 0) {
              status = filteredCharapter[0].status;

              episodes.push({
                name: charapter.name,
                episode: charapter.chapter_number,
                link: charapter.link,
                status: status
              });
            }
            else {
              episodes.push({
                name: charapter.name,
                episode: charapter.chapter_number,
                link: charapter.link,
                status: 'false'
              });
            }
          });

          const synology = container.querySelector('#synology-tab-pane');
          const list = document.createElement('ul');
          list.classList.add('list-group', 'list-group-flush');

          episodes.forEach(episode => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'item-'+ episode.episode);

            if (episode.status === 'false') {
              const anchor = document.createElement('a');
              anchor.classList.add('download-link');
              anchor.name = episode.name;
              anchor.textContent = 'Episode ' + episode.episode;
              anchor.href = encodeURIComponent('https:' + episode.link);

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

          container.querySelectorAll('.download-link').forEach(button => {
            button.addEventListener('click', function(e) {
              e.preventDefault();
              const url = this.getAttribute('href');
              const name = this.name;
              const episode = this.textContent;
              const item = this.closest('.list-group-item').classList[1];
              const title = this.closest('.text').querySelector('h2').textContent;

              sendURL(url, title, episode, name, item);
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
       * Function for send the download url.
       */
      function sendURL(url, title, episode, name, item) {
        const params = `info=download-station&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&episode=${encodeURIComponent(episode)}`;
        fetchRequest('../includes/synology.php', params, (err, responseData) => {
          if (err) {
            console.log('Error in sendURL:', err);
            return;
          }

          if (responseData.download.error) {
            return;
          }

          idDownload(name, episode, title, item);
        });
      }

      /*
       * Function for get the download information.
       */
      function idDownload(name, episode, title, item) {
        const intervalDownload = setInterval(() => {
          const params = `info=id-download&name=${encodeURIComponent(name)}`;
          fetchRequest('../includes/synology.php', params, (err, responseData) => {
            if (err) {
              console.log('Error in idDownload:', err);
              return;
            }

            console.log(responseData);

            if (responseData.id.download == 'downloading') {
              const id = responseData.id.id;
              clearInterval(intervalDownload);
              infoDownload(id, episode, title, name, item);
            }
          });
        }, 1000);
      }

      /*
      * Function for start to download.
      */
      function infoDownload(id, episode, title, name, item,) {
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
              const downloadLink = list.querySelector('.download-link');
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

          console.log(responseData);
        });
      }

      /*
       * Function for add progress bar to canvas.
       */
      function createProgressBar(id, progress, item) {
        console.log(id);
        console.log(progress);
        console.log(item);

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