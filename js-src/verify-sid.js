/**
 * @file
 * Add functionality for verify SID.
 */

(function ($) {
  window.loginForm = '';
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('animeflv.php')) {
      const sid = getCookie('sid');
      const domain = getCookie('domain');

      if (sid) {
        validateSID(sid, domain);
      }

      if (!sid) {
        loginForm = `
        <p>Necesita agregar sus credenciales de Synology</p>
        <button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#sidModal">Abrir formulario de Synology</button>
        `;
      }

      /*
        * Function for get cookie.
        */
      function getCookie(name) {
        const cookies = document.cookie.split(';').map(cookie => cookie.trim());
        const foundCookie = cookies.find(cookie => cookie.startsWith(name + '='));
        return foundCookie ? foundCookie.substring((name + '=').length) : null;
      }

      /*
        * Function for delete cookie.
        */
      function deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      }

      /*
        * Function for validate SID.
        */
      function validateSID(sid, domain) {
        fetch(`../includes/sid.php?info=validate-sid&sid=${encodeURIComponent(sid)}&domain=${encodeURIComponent(domain)}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.log(data.error);
            return;
          }

          if (data.validate.status === 'false') {
            console.log(data.validate.message);
            deleteCookie('sid');
            deleteCookie('domain');
          }
        })
        .catch(error => {
          console.error("Error getting data:", error);
        });
      }
    }
  });
})(jQuery);