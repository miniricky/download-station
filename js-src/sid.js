/**
 * @file
 * Add functionality for Packages information.
 */

(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('animeflv.php')) {
      const sidContainer = document.querySelector('#sid');
      const sidForm = sidContainer.querySelector('#sid-form');

      sidForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = sidForm.querySelector('#username').value.trim();
        const password = sidForm.querySelector('#password').value.trim();
        const domain = sidForm.querySelector('#domain').value.trim();

        if (!(username ==="" || password ==="" || domain ==="")) {
          login(username, password, domain, sidForm);
        }
        else{
          console.log('Please complete all fields.');
        }
      });

      /*
      * Function for create XHR.
      */
      function createXHR(url, params, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              try {
                const responseData = JSON.parse(xhr.responseText);
                callback(null, responseData);
              } catch (e) {
                callback(e, null);
                console.log(e + xhr.responseText);
              }
            } else {
              callback(new Error('Error in AJAX request: ' + xhr.statusText), null);
              console.log('Error in AJAX request: ' + xhr.statusText);
            }
          }
        };
        xhr.send(params);
      }

      /*
      * Function for login.
      */
      function login(username, password, domain, sidForm) {
        const data = `info=sid&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&domain=${encodeURIComponent(domain)}`;
        createXHR('../includes/sid.php', data, function (err, responseData) {
          if (err) {
            console.error(err);
            return;
          }

          if (responseData.login.status === 'true') {
            setCookie('sid', responseData.login.sid, 7);
            setCookie('domain', responseData.login.domain, 7);
            
            const modalElement = document.querySelector('#sidModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);

            if (modalInstance) {
              modalInstance.hide();
            }

            sidForm.reset();
          }
        });
      }

      /*
      * Function for set cookie.
      */
      function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expiration = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expiration + ";path=/";
      }

      /*
      * Function for get cookie.
      */
      function getCookie(name) {
        const cookies = document.cookie.split(';').map(cookie => cookie.trim());
        const foundCookie = cookies.find(cookie => cookie.startsWith(name + '='));
        return foundCookie ? foundCookie.substring((name + '=').length) : null;
      }
    }
  });
})(jQuery);