/* Theme toggle. The page defaults to the ink (dark) design for everyone; a click
   stores an explicit light/dark choice. Without JS the button stays hidden and the
   page stays ink. The saved choice is applied by an inline script in <head>
   (before first paint) to avoid a flash of the wrong theme. */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  function current() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function sync() {
    btn.setAttribute('aria-pressed', current() === 'dark' ? 'true' : 'false');
  }

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { window.localStorage.setItem('fb-theme', next); } catch (e) { /* storage blocked */ }
    sync();
  });
  sync();
  btn.hidden = false;
})();
