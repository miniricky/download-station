/**
 * @file
 * Add functionality for verify SID.
 */

(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('synology.html') || window.location.pathname.includes('login.html')) {
      const sid = getCookie('sid');
      const domain = getCookie('domain');

      if (sid) {
        validateSID(sid, domain);
      }

      /*
        * Function for get cookie.
        */
      function getCookie(name) {
        const cookies = document.cookie.split(';').map(cookie => cookie.trim());
        const foundCookie = cookies.find(cookie => cookie.startsWith(name + '='));
        return foundCookie ? foundCookie.substring((name + '=').length) : null;
      }

      function deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      }

      /*
        * Function for making POST requests.
        */
      async function fetchData(url, params) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
          });

          if (!response.ok) {
            throw new Error('Error in AJAX request: ' + response.statusText);
          }

          const responseData = await response.json();
          return responseData;
        } catch (error) {
          console.log('Error:', error);
          throw error;
        }
      }

      /*
        * Function to validate SID.
        */
      async function validateSID(sid, domain) {
        const data = `info=validate-sid&sid=${encodeURIComponent(sid)}&domain=${encodeURIComponent(domain)}`;
        try {
          const responseData = await fetchData('../includes/login.php', data);
          if (responseData.validate.status === 'false') {
            console.log(responseData.validate.message);
            deleteCookie('sid');
            deleteCookie('domain');
            window.location.href = 'login.html';
          }
        } catch (error) {
          console.error('Validation error:', error);
        }
      }
    }
  });
})(jQuery);