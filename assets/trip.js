(function () {
  var T = window.TRIP || {};
  var islands = T.islands || [];
  var others = T.participants || [];
  var roles = T.roles || [];
  // Islands and other participants share one list so popups and activity chips can refer to either
  var all = islands.map(function (x) { return Object.assign({ kind: 'island' }, x); })
    .concat(others.map(function (x) { return Object.assign({ kind: 'other' }, x); }));

  var EMPTY = 'އަދި މައުލޫމާތެއް ނެތް';
  var ICON = {
    user: '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',
    phone: '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    list: '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 10h6M9 14h6M9 18h4"/></svg>',
    team: '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.5 3.6 5.2"/></svg>',
    clock: '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    mail: '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    building: '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V7l8-4 8 4v14"/><path d="M10 10h4M12 8v4"/><path d="M9 21v-5h6v5"/></svg>',
    info: '<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function list(arr) {
    return arr && arr.length
      ? '<ul class="bullets">' + arr.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>'
      : '<p class="none">' + EMPTY + '</p>';
  }

  /* ---------- Bottom sheet ---------- */
  var sheet = document.getElementById('sheet');
  var sheetBody = document.getElementById('sheet-body');
  function openSheet(html) {
    sheetBody.innerHTML = html;
    if (sheet.showModal) sheet.showModal(); else sheet.setAttribute('open', '');
  }
  sheet.querySelector('.sheet-close').addEventListener('click', function () { sheet.close(); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });

  /* ---------- Islands ---------- */
  function islandSheet(i) {
    var isl = all[i];
    var info = isl.info || {};
    var infoKeys = Object.keys(info);
    var h = '<h2>' + (isl.kind === 'island' ? 'ބ. ' : '') + esc(isl.name) + '</h2>';
    h += '<div class="contact-card">';
    h += '<div>' + ICON.user + '<span class="lbl">ފޯކަލް ޕޮއިންޓް</span><strong>' + (isl.focal ? esc(isl.focal) : '—') + '</strong></div>';
    if (isl.title) h += '<div class="contact-title">' + esc(isl.title) + '</div>';
    h += '<div>' + ICON.phone + '<span class="lbl">ނަންބަރު</span>' +
      (isl.phone ? '<a href="tel:' + esc(String(isl.phone).replace(/\s/g, '')) + '" dir="ltr"><strong>' + esc(isl.phone) + '</strong></a>' : '<strong>—</strong>') + '</div>';
    if (isl.email) h += '<div>' + ICON.mail + '<span class="lbl">އީމެއިލް</span><a href="mailto:' + esc(isl.email) + '" dir="ltr"><strong>' + esc(isl.email) + '</strong></a></div>';
    h += '</div>';
    h += '<h3>އެދިފައިވާ ހަރަކާތްތައް</h3>' + list(isl.activities);

    var team = isl.team || [];
    h += '<h3>ޓީމް</h3>';
    h += team.length
      ? '<ul class="team">' + team.map(function (m) {
          return '<li>' + ICON.user + '<span class="team-name">' + esc(m.name) + '</span>' +
            (m.role ? '<span class="team-role">' + esc(m.role) + '</span>' : '') + '</li>';
        }).join('') + '</ul>'
      : '<p class="none">' + EMPTY + '</p>';

    var sched = isl.schedule || [];
    h += '<h3>ހަރަކާތްތަކުގެ ޝެޑިއުލް</h3>';
    if (sched.length) {
      var days = [], byDay = {};
      sched.forEach(function (s) {
        var d = s.day || '';
        if (!byDay[d]) { byDay[d] = []; days.push(d); }
        byDay[d].push(s);
      });
      h += days.map(function (d) {
        return '<div class="sched-day">' + (d ? '<p class="sched-date">' + esc(d) + '</p>' : '') +
          '<ul class="sched">' + byDay[d].map(function (s) {
            return '<li><span class="sched-time" dir="ltr">' + esc(s.time || '') + '</span><span>' + esc(s.activity) + '</span></li>';
          }).join('') + '</ul></div>';
      }).join('');
    } else {
      h += '<p class="none">' + EMPTY + '</p>';
    }

    h += '<h3>އިތުރު މައުލޫމާތު</h3>';
    h += infoKeys.length
      ? '<dl class="kv">' + infoKeys.map(function (k) { return '<dt>' + esc(k) + '</dt><dd>' + esc(info[k]) + '</dd>'; }).join('') + '</dl>'
      : '<p class="none">' + EMPTY + '</p>';
    openSheet(h);
  }

  var grid = document.getElementById('island-grid');
  var totalActs = 0, totalTeam = 0;
  all.forEach(function (x) { totalActs += (x.activities || []).length; totalTeam += (x.team || []).length; });
  var summary = '<div class="island-summary">' +
    '<div><strong>' + islands.length + '</strong><span>ރަށް</span></div>' +
    '<div><strong>' + totalActs + '</strong><span>ހަރަކާތް</span></div>' +
    '<div><strong>' + totalTeam + '</strong><span>ޓީމު މެމްބަރުން</span></div></div>';

  function stat(icon, n, label) {
    return '<span class="stat' + (n ? '' : ' stat-zero') + '">' + icon + '<b>' + n + '</b> ' + label + '</span>';
  }
  function card(x, i, num) {
    var island = x.kind === 'island';
    return '<div class="island' + (island ? '' : ' island-other') + '" role="button" tabindex="0" data-i="' + i + '">' +
      '<div class="island-head">' +
        (island ? '<span class="island-num">' + num + '</span><span class="island-atoll">ބ.</span>' : '<span class="head-icon">' + ICON.building + '</span>') +
        '<span class="island-name">' + esc(x.name) + '</span></div>' +
      '<div class="island-body">' +
        '<div class="focal"><span class="avatar">' + (x.focal ? esc(x.focal.charAt(0)) : ICON.user) + '</span>' +
          '<span class="focal-text"><span class="focal-label">ފޯކަލް ޕޮއިންޓް</span><span class="focal-name">' + (x.focal ? esc(x.focal) : '—') + '</span>' +
          (x.title ? '<span class="focal-title">' + esc(x.title) + '</span>' : '') + '</span></div>' +
        (x.phone ? '<a class="call" href="tel:' + esc(String(x.phone).replace(/\s/g, '')) + '">' + ICON.phone + '<span dir="ltr">' + esc(x.phone) + '</span></a>' : '') +
      '</div>' +
      '<div class="island-stats">' +
        stat(ICON.list, (x.activities || []).length, 'ހަރަކާތް') +
        stat(ICON.team, (x.team || []).length, 'މީހުން') +
        stat(ICON.clock, (x.schedule || []).length, 'ޝެޑިއުލް') +
      '</div></div>';
  }

  var html = '';
  if (islands.length) {
    html += summary + '<div class="island-cards">' +
      all.filter(function (x) { return x.kind === 'island'; }).map(function (x, n) { return card(x, n, n + 1); }).join('') + '</div>';
  }
  if (others.length) {
    html += '<h2 class="group-title">އެހެނިހެން ބައިވެރިން</h2><div class="island-cards">' +
      others.map(function (x, n) { return card(all[islands.length + n], islands.length + n); }).join('') + '</div>';
  }
  grid.innerHTML = html || '<p class="none">' + EMPTY + '</p>';
  grid.addEventListener('click', function (e) {
    if (e.target.closest('.call')) return;
    var b = e.target.closest('.island');
    if (b) islandSheet(+b.dataset.i);
  });
  grid.addEventListener('keydown', function (e) {
    var b = e.target.closest('.island');
    if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); islandSheet(+b.dataset.i); }
  });

  /* ---------- Roles (org structure) ---------- */
  var flatRoles = [];
  function roleNode(r) {
    var id = flatRoles.push(r) - 1;
    var kids = r.team || [];
    return '<li><div class="node">' +
      '<div class="node-text"><span class="node-role">' + esc(r.role) + '</span>' +
      '<span class="node-name">' + (r.name ? esc(r.name) : '—') + '</span></div>' +
      '<button class="info-btn" data-r="' + id + '" aria-label="ޒިންމާތައް">' + ICON.info + '</button>' +
      '</div>' + (kids.length ? '<ul>' + kids.map(roleNode).join('') + '</ul>' : '') + '</li>';
  }
  var org = document.getElementById('org');
  org.innerHTML = roles.length ? '<ul class="tree">' + roles.map(roleNode).join('') + '</ul>' : '<p class="none">' + EMPTY + '</p>';
  org.addEventListener('click', function (e) {
    var b = e.target.closest('.info-btn');
    if (!b) return;
    var r = flatRoles[+b.dataset.r];
    openSheet('<p class="sheet-kicker">' + esc(r.role) + '</p><h2>' + (r.name ? esc(r.name) : '—') + '</h2>' +
      '<h3>ޒިންމާތައް</h3>' + list(r.responsibilities));
  });

  /* ---------- Activities (grouped across islands) ---------- */
  var acts = {};
  all.forEach(function (isl, i) {
    (isl.activities || []).forEach(function (a) {
      var key = String(a).trim();
      if (!key) return;
      (acts[key] = acts[key] || []).push(i);
    });
  });
  var actNames = Object.keys(acts).sort(function (a, b) { return acts[b].length - acts[a].length; });
  var actEl = document.getElementById('activity-list');
  actEl.innerHTML = actNames.length
    ? '<p class="summary">' + actNames.length + ' ހަރަކާތް · ' + all.filter(function (s) { return (s.activities || []).length; }).length + ' ބައިވެރިންގެ ފަރާތުން</p>' +
      actNames.map(function (a) {
        return '<div class="act">' +
          '<div class="act-head"><span class="act-name">' + esc(a) + '</span>' +
          '<span class="act-count"><strong>' + acts[a].length + '</strong> ' +
            (acts[a].every(function (i) { return all[i].kind === 'island'; }) ? 'ރަށް' : 'ބައިވެރިން') + '</span></div>' +
          '<div class="chips">' + acts[a].map(function (i) {
            return '<button class="chip" data-i="' + i + '">' + esc(all[i].name) + '</button>';
          }).join('') + '</div></div>';
      }).join('')
    : '<p class="none">އަދި އެއްވެސް ރަށަކުން ހަރަކާތެއް އެދިފައެއް ނުވޭ</p>';
  actEl.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (b) islandSheet(+b.dataset.i);
  });

  /* ---------- Facilitators ---------- */
  var F = T.facilitators || {};
  var facGroups = [
    { title: 'ޝައިޚުން', people: F.sheikhs || [] },
    { title: 'އެހެނިހެން', people: F.others || [] }
  ];
  var facAll = [];
  var PIN = '<svg class="icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  var WORKSHOP = '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/></svg>';

  function inMale(p) { return !(p.route || []).length; }
  function routeChain(p) {
    if (inMale(p) && !p.island) return '<span class="route-chip">—</span>';
    if (inMale(p)) return '<span class="route-chip route-male">މާލޭގައި</span>';
    return '<span class="route-chain">' + p.route.map(function (r) { return '<span>' + esc(r) + '</span>'; }).join('<i>←</i>') + '</span>';
  }
  function facCard(p, i) {
    return '<div class="fac" role="button" tabindex="0" data-f="' + i + '">' +
      '<div class="fac-top"><span class="fac-avatar">' + (p.name ? esc(p.name.charAt(0)) : ICON.user) + '</span>' +
        '<div class="fac-id"><span class="fac-name">' + (p.name ? esc(p.name) : '—') + '</span>' +
        (p.island ? '<span class="fac-island">' + PIN + esc(p.island) + '</span>' : '') + '</div></div>' +
      '<div class="fac-route"><span class="fac-label">ދަތުރުގެ މަގު</span>' + routeChain(p) + '</div>' +
      (p.phone ? '<a class="call fac-call" href="tel:' + esc(String(p.phone).replace(/\s/g, '')) + '">' + ICON.phone + '<span dir="ltr">' + esc(p.phone) + '</span></a>' : '') +
      '<div class="island-stats">' +
        stat(ICON.list, (p.activities || []).length, 'ހަރަކާތް') +
        stat(WORKSHOP, (p.workshops || []).length, 'ވޯކްޝޮޕް') +
      '</div></div>';
  }
  function facSheet(i) {
    var p = facAll[i];
    var h = '<p class="sheet-kicker">' + esc(p._group) + '</p><h2>' + (p.name ? esc(p.name) : '—') + '</h2>';
    h += '<div class="contact-card">';
    h += '<div>' + PIN + '<span class="lbl">ރަށް</span><strong>' + (p.island ? esc(p.island) : '—') + '</strong></div>';
    if (p.phone) h += '<div>' + ICON.phone + '<span class="lbl">ނަންބަރު</span><a href="tel:' + esc(String(p.phone).replace(/\s/g, '')) + '" dir="ltr"><strong>' + esc(p.phone) + '</strong></a></div>';
    h += '</div>';
    if (p.email) h = h.replace(/<\/div>$/, '') + '<div>' + ICON.mail + '<span class="lbl">އީމެއިލް</span><a href="mailto:' + esc(p.email) + '" dir="ltr"><strong>' + esc(p.email) + '</strong></a></div></div>';
    h += '<h3>ދަތުރުގެ މަގު</h3>';
    h += inMale(p) && !p.island ? '<p class="none">' + EMPTY + '</p>' : inMale(p)
      ? '<p><span class="route-chip route-male">މާލޭގައި</span></p>'
      : '<ol class="route-steps">' + p.route.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ol>';
    h += '<h3>ކުރެވޭނެ ހަރަކާތްތައް</h3>' + list(p.activities);
    h += '<h3>ވޯކްޝޮޕްތައް</h3>' + list(p.workshops);
    openSheet(h);
  }
  var facEl = document.getElementById('facilitators');
  if (facEl) {
    facEl.innerHTML = facGroups.map(function (g) {
      var cards = g.people.map(function (p) {
        var i = facAll.push(Object.assign({ _group: g.title }, p)) - 1;
        return facCard(p, i);
      }).join('');
      return '<h2 class="group-title">' + g.title + ' <span class="group-count">' + g.people.length + '</span></h2>' +
        (cards ? '<div class="fac-cards">' + cards + '</div>' : '<p class="none">' + EMPTY + '</p>');
    }).join('');
    facEl.addEventListener('click', function (e) {
      if (e.target.closest('.call')) return;
      var b = e.target.closest('.fac');
      if (b) facSheet(+b.dataset.f);
    });
    facEl.addEventListener('keydown', function (e) {
      var b = e.target.closest('.fac');
      if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); facSheet(+b.dataset.f); }
    });
  }

  /* ---------- Tabs ---------- */
  var tabs = document.querySelectorAll('.tabs [data-tab]');
  var panels = document.querySelectorAll('.panel');
  function show(name) {
    if (!document.querySelector('[data-panel="' + name + '"]')) name = 'islands';
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.tab === name); });
    panels.forEach(function (p) { p.hidden = p.dataset.panel !== name; });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      history.replaceState(null, '', '#' + t.dataset.tab);
      show(t.dataset.tab);
    });
  });
  show(location.hash.slice(1));
})();
