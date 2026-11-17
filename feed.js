/* Feed filters (progressive enhancement). Without JS the server-rendered table is
   the feed and the filter form stays hidden. With JS: filter the rendered rows; if the
   build capped the table, load feed.json and render every row first. Text from the
   JSON is set with textContent only; links are limited to sec.gov and ticker pages. */
(function () {
  var form = document.getElementById('feed-filters');
  var body = document.getElementById('feed-rows');
  var count = document.getElementById('feed-count');
  if (!form || !body || !count) return;
  var root = form.getAttribute('data-root') || '';
  var q = form.elements.q, src = form.elements.source, cat = form.elements.category,
      min = form.elements.min;

  function item(tr) {
    return { el: tr, q: tr.getAttribute('data-q') || '', s: tr.getAttribute('data-s'),
             g: tr.getAttribute('data-g'), n: +tr.getAttribute('data-n') };
  }
  var items = Array.prototype.map.call(body.rows, item);

  function add(parent, tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    return e;
  }
  function cell(tr, label) {
    var td = add(tr, 'td');
    td.setAttribute('data-label', label);
    return add(td, 'div');
  }
  function row(r) {
    var tr = document.createElement('tr');
    tr.setAttribute('data-q', [r.c, r.t || '', r.l].join(' ').toLowerCase());
    tr.setAttribute('data-s', r.s);
    tr.setAttribute('data-g', r.g);
    tr.setAttribute('data-n', r.n);
    var t = add(cell(tr, 'Filed'), 'time', null, r.d);
    t.setAttribute('datetime', r.d);
    var c = cell(tr, 'Company');
    add(c, 'div', 'company', r.c);
    var tk = add(c, 'div', 'ticker');
    if (r.t && /^t\/[A-Z0-9][A-Z0-9.-]*\/index\.html$/.test(r.p || '')) {
      var a = add(tk, 'a', null, r.t);
      a.href = root + r.p;
    } else {
      tk.textContent = r.t || '';
    }
    var f = cell(tr, 'Filing');
    add(f, 'div', 'sig-label', r.l);
    var meta = add(f, 'div', 'sig-meta');
    var st = add(meta, 'span', 'strength');
    add(st, 'span', 'pips n' + r.n).setAttribute('aria-hidden', 'true');
    st.appendChild(document.createTextNode('Strength ' + r.n + '/5'));
    meta.appendChild(document.createTextNode(' '));
    add(meta, 'span', 'cat', r.g);
    cell(tr, 'Form').textContent = r.f || '';
    var s = cell(tr, 'Link');
    if (/^https:\/\/(www\.)?sec\.gov\//.test(r.u || '')) {
      var e = add(s, 'a', 'edgar', 'EDGAR');
      e.href = r.u;
      e.rel = 'noopener';
      add(e, 'span', 'visually-hidden',
          ': ' + (r.f || 'filing') + ' for ' + r.c + ', filed ' + r.d);
    } else {
      add(s, 'span', 'muted', 'Not available');
    }
    return tr;
  }

  function apply() {
    var text = q.value.trim().toLowerCase(), s = src.value, g = cat.value,
        n = +min.value || 0, shown = 0;
    items.forEach(function (it) {
      var ok = (!text || it.q.indexOf(text) !== -1) && (!s || it.s === s) &&
               (!g || it.g === g) && it.n >= n;
      it.el.hidden = !ok;
      if (ok) shown++;
    });
    count.textContent = shown + ' of ' + items.length + ' filings shown.';
  }

  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  var total = +form.getAttribute('data-total');
  if (total > items.length && window.fetch) {
    fetch(form.getAttribute('data-src'))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rows) {
        var frag = document.createDocumentFragment();
        var next = rows.map(function (r) { var tr = row(r); frag.appendChild(tr); return item(tr); });
        body.textContent = '';
        body.appendChild(frag);
        items = next;
        apply();
      })
      .catch(function () { /* keep the rendered rows */ });
  }
  form.hidden = false;
  apply();
})();
