/* After a user accepts a Netlify Identity invite / logs in on the homepage,
   send them to the CMS admin panel. */
(function () {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', function (user) {
      if (!user) {
        window.netlifyIdentity.on('login', function () {
          document.location.href = '/admin/';
        });
      }
    });
  }
})();
