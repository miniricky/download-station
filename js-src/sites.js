/**
 * @file
 * Add functionality add new site.
 */

(function ($) {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('sites.php')) {
      // Add form submission handler
      const form = document.getElementById('addSiteForm');
      
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const formData = new FormData();
          formData.append('name', document.getElementById('site').value);
          formData.append('url', document.getElementById('url').value);
          formData.append('image', document.getElementById('image').files[0]);

          fetch('../includes/add-site.php', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            if (data.status === 'success') {
              form.reset();
              window.location.reload();
            } else {
              alert(data.message);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('Error saving site');
          });
        });
      }
    }
  });
})(jQuery);