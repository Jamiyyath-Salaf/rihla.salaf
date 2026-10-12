(function () {
  var T = window.TRIP || {};
  var islands = T.islands || [];
  var others = T.participants || [];
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
    h += '<h3>އެދިފައިވާ ހަރަކާތްތައް</h3>' + (isl.pending ? '<p>' + '<span class="pending-tag">ހަރަކާތްތައް އަދި ނުލިބޭ</span>' + '</p>' : list(isl.activities));

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
        (x.pending ? '<span class="pending-tag">ހަރަކާތްތައް އަދި ނުލިބޭ</span>' : stat(ICON.list, (x.activities || []).length, 'ހަރަކާތް')) +
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

  /* ---------- Org chart: levels of people, top level first ---------- */
  var levels = (T.org || []).filter(function (l) { return (l.people || []).length; });
  var flatRoles = [];
  var org = document.getElementById('org');
  org.innerHTML = levels.length ? '<div class="orgchart">' + levels.map(function (l, li) {
    return (li ? '<div class="org-link" aria-hidden="true"></div>' : '') +
      '<div class="org-level' + (li ? '' : ' org-top') + '" style="--n:' + l.people.length + '">' + l.people.map(function (p) {
        var id = flatRoles.push(p) - 1;
        return '<div class="org-node">' +
          '<span class="org-avatar">' + (p.name ? esc(p.name.charAt(0)) : ICON.user) + '</span>' +
          '<span class="org-name">' + (p.name ? esc(p.name) : '—') + '</span>' +
          (p.role ? '<span class="org-role">' + esc(p.role) + '</span>' : '') +
          '<button class="info-btn" data-r="' + id + '" aria-label="ޒިންމާތައް">' + ICON.info + '</button>' +
          '</div>';
      }).join('') + '</div>';
  }).join('') + '</div>' : '<p class="none">' + EMPTY + '</p>';
  org.addEventListener('click', function (e) {
    var b = e.target.closest('.info-btn');
    if (!b) return;
    var r = flatRoles[+b.dataset.r];
    openSheet((r.role ? '<p class="sheet-kicker">' + esc(r.role) + '</p>' : '') + '<h2>' + (r.name ? esc(r.name) : '—') + '</h2>' +
      '<h3>ޒިންމާތައް</h3>' + list(r.responsibilities));
  });

  /* ---------- Activities (grouped across islands) ---------- */
  // Activities with different wording but the same meaning are joined by T.activity_groups
  var groupOf = {};
  (T.activity_groups || []).forEach(function (g) { (g.items || []).forEach(function (t) { groupOf[String(t).trim()] = g.name; }); });
  var acts = {};   // group name -> [{i: participant index, text: original wording}]
  all.forEach(function (isl, i) {
    (isl.activities || []).forEach(function (a) {
      var text = String(a).trim();
      if (!text) return;
      var key = groupOf[text] || text;
      (acts[key] = acts[key] || []).push({ i: i, text: text });
    });
  });
  function uniq(list) { return list.map(function (x) { return x.i; }).filter(function (i, n, arr) { return arr.indexOf(i) === n; }); }
  var actNames = Object.keys(acts).sort(function (a, b) { return uniq(acts[b]).length - uniq(acts[a]).length; });
  var actEl = document.getElementById('activity-list');
  actEl.innerHTML = actNames.length
    ? '<p class="summary">' + actNames.length + ' ހަރަކާތް · ' + all.filter(function (s) { return (s.activities || []).length; }).length + ' ބައިވެރިންގެ ފަރާތުން</p>' +
      '<div class="act-grid">' + actNames.map(function (a, n) {
        var who = uniq(acts[a]);
        return '<div class="act" data-g="' + n + '" role="button" tabindex="0">' +
          '<div class="act-head"><span class="act-name">' + esc(a) + '</span>' +
          '<span class="act-count"><strong>' + who.length + '</strong> ' +
            (who.every(function (i) { return all[i].kind === 'island'; }) ? 'ރަށް' : 'ބައިވެރިން') + '</span></div>' +
          '<div class="chips">' + who.map(function (i) {
            return '<button class="chip" data-i="' + i + '">' + esc(all[i].name) + '</button>';
          }).join('') + '</div></div>';
      }).join('') + '</div>'
    : '<p class="none">އަދި އެއްވެސް ރަށަކުން ހަރަކާތެއް އެދިފައެއް ނުވޭ</p>';
  var pend = all.map(function (x, i) { return x.pending ? i : -1; }).filter(function (i) { return i >= 0; });
  if (pend.length) actEl.innerHTML = '<div class="pending-box"><span>ހަރަކާތްތައް އަދި ނުލިބޭ:</span><div class="chips">' +
    pend.map(function (i) { return '<button class="chip" data-i="' + i + '">' + esc(all[i].name) + '</button>'; }).join('') + '</div></div>' + actEl.innerHTML;
  /* ---------- Print: activities by island, then by activity ---------- */
  var printBtn = document.createElement('div');
  printBtn.className = 'print-bar';
  printBtn.innerHTML = '<button type="button" class="print-btn"><svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/></svg><span>ޑައުންލޯޑް (PDF)</span></button>';
  actEl.insertBefore(printBtn, actEl.firstChild);
  printBtn.querySelector('button').addEventListener('click', function () {
    var title = (document.querySelector('.event h1') || {}).textContent || '';
    var sub = (document.querySelector('.event-sub') || {}).textContent || '';
    var logo = document.querySelector('link[rel="icon"]');
    var islandsOnly = all.filter(function (x) { return x.kind === 'island'; });
    var others = all.filter(function (x) { return x.kind !== 'island'; });
    function num(v) { return '<span class="p-num">' + v + '</span>'; }
    function block(x, n) {
      var acts = x.activities || [];
      return '<section class="p-island"><h3>' + (n ? '<span class="p-n">' + n + '</span>' : '') + (x.kind === 'island' ? 'ބ. ' : '') + esc(x.name) +
        (x.focal ? '<small>' + esc(x.focal) + (x.phone ? ' · ' + num(esc(x.phone)) : '') + '</small>' : '') + '</h3>' +
        (x.pending ? '<p class="p-pending">ހަރަކާތްތައް އަދި ނުލިބޭ</p>'
          : acts.length ? '<div class="p-list">' + acts.map(function (a, k) { return '<div class="p-row"><span class="p-k">' + (k + 1) + '.</span><span>' + esc(a) + '</span></div>'; }).join('') + '</div>' : '<p class="p-pending">—</p>') +
        '</section>';
    }
    var totalActs = all.reduce(function (n, x) { return n + (x.activities || []).length; }, 0);
    var html =
      '<header class="p-head">' + (logo ? '<img src="' + logo.href + '" alt="">' : '') +
        '<div><h1>' + esc(title).replace(/(\d+)/g, num('$1')) + '</h1><p>' + esc(sub).replace(/(\d+)/g, num('$1')) + '</p></div></header>' +
      '<h2>' + num('1.') + ' ރަށްތަކުން އެދިފައިވާ ހަރަކާތްތައް</h2>' +
      '<p class="p-sum">' + num(islandsOnly.length) + ' ރަށް · ' + num(totalActs) + ' ހަރަކާތް</p>' +
      '<div class="p-grid">' + islandsOnly.map(function (x, i) { return block(x, i + 1); }).join('') + '</div>' +
      (others.length ? '<h2 class="p-sub">އެހެނިހެން ބައިވެރިން</h2><div class="p-grid">' + others.map(function (x) { return block(x); }).join('') + '</div>' : '') +
      '<div class="html2pdf__page-break"></div><h2 class="p-break">' + num('2.') + ' ހަރަކާތްތަކަށް އެދިފައިވާ ރަށްތައް</h2>' +
      '<p class="p-sum">' + num(actNames.length) + ' ހަރަކާތް · ބޮޑު އަދަދަކުން އެދިފައިވާ ހަރަކާތްތައް މަތީގައި</p>' +
      '<table class="p-table"><thead><tr><th>#</th><th>ހަރަކާތް</th><th>އަދަދު</th><th>ރަށްތައް</th></tr></thead><tbody>' +
      actNames.map(function (a, i) {
        var who = uniq(acts[a]);
        return '<tr><td>' + (i + 1) + '</td><td>' + esc(a) + '</td><td class="p-c">' + who.length + '</td><td>' +
          who.map(function (k) { return esc(all[k].name); }).join('، ') + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<p class="p-foot">ތައްޔާރުކުރި ތާރީޚު: ' + dvDate(today).replace(/(\d+)/g, num('$1')) + '</p>';
    var btn = printBtn.querySelector('button'), label = btn.querySelector('span');
    var doc = document.createElement('div');
    doc.className = 'pdf-doc';
    doc.innerHTML = html;
    // The PDF engine loses spaces between right-to-left words, so give every word its own box
    (function wordify(root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) if (/\S\s+\S/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        var frag = document.createDocumentFragment();
        n.nodeValue.split(/\s+/).forEach(function (w, i, arr) {
          if (!w) return;
          // right-to-left marks keep brackets and commas on the correct side
          var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = /[\u0780-\u07BF]/.test(w) ? '\u200F' + w + '\u200F' : w; frag.appendChild(sp);
          if (i < arr.length - 1) frag.appendChild(document.createTextNode(' '));
        });
        n.parentNode.replaceChild(frag, n);
      });
    })(doc);
    function save() {
      label.textContent = 'ތައްޔާރުކުރަނީ...'; btn.disabled = true;
      document.fonts.ready.then(function () {
        return window.html2pdf().set({
          margin: [10, 10, 12, 10],
          filename: (title || 'activities').trim() + ' - ހަރަކާތްތައް.pdf',
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['.p-island', 'tr', '.p-head'] }
        }).from(doc).save();
      }).catch(function () { alert('PDF ހެދިއެއް ނުދިޔައީ. އަލުން މަސައްކަތްކުރައްވާ.'); })
        .then(function () { label.textContent = 'ޑައުންލޯޑް (PDF)'; btn.disabled = false; });
    }
    if (window.html2pdf) save();
    else {
      label.textContent = 'ތައްޔާރުކުރަނީ...';
      var sc = document.createElement('script');
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      sc.onload = save;
      sc.onerror = function () { label.textContent = 'ޑައުންލޯޑް (PDF)'; alert('PDF ހެދިއެއް ނުދިޔައީ. އިންޓަނެޓް ޗެކްކުރައްވާ.'); };
      document.head.appendChild(sc);
    }
  });

  function actSheet(n) {
    var a = actNames[n];
    openSheet('<p class="sheet-kicker">ހަރަކާތް</p><h2>' + esc(a) + '</h2>' +
      '<h3>' + uniq(acts[a]).length + ' ރަށުން ލިޔެފައިވާ ގޮތް</h3><ul class="act-sources">' +
      acts[a].map(function (x) {
        return '<li><button class="chip" data-i="' + x.i + '">' + esc(all[x.i].name) + '</button><span>' + esc(x.text) + '</span></li>';
      }).join('') + '</ul>');
  }
  actEl.addEventListener('click', function (e) {
    var c = e.target.closest('.chip');
    if (c) { islandSheet(+c.dataset.i); return; }
    var g = e.target.closest('.act');
    if (g) actSheet(+g.dataset.g);
  });
  actEl.addEventListener('keydown', function (e) {
    var g = e.target.closest('.act');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); actSheet(+g.dataset.g); }
  });
  // chips inside the popup open that island
  sheet.addEventListener('click', function (e) {
    var c = e.target.closest('.act-sources .chip');
    if (c) islandSheet(+c.dataset.i);
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
    function tags(arr) {
      return arr && arr.length ? '<div class="tag-list">' + arr.map(function (a) { return '<span>' + esc(a) + '</span>'; }).join('') + '</div>'
        : '<p class="none">' + EMPTY + '</p>';
    }
    h += '<div class="side-by-side">' +
      '<div><h3>ކުރެވޭނެ ހަރަކާތްތައް</h3>' + tags(p.activities) + '</div>' +
      '<div><h3>ވޯކްޝޮޕްތައް</h3>' + tags(p.workshops) + '</div></div>';
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

  /* ---------- Tasks ---------- */
  var MONTHS = ['ޖަނަވަރީ', 'ފެބްރުއަރީ', 'މާރިޗު', 'އޭޕްރީލް', 'މެއި', 'ޖޫން', 'ޖުލައި', 'އޮގަސްޓު', 'ސެޕްޓެމްބަރު', 'އޮކްޓޫބަރު', 'ނޮވެންބަރު', 'ޑިސެމްބަރު'];
  var DAYS = ['އާދިއްތަ', 'ހޯމަ', 'އަންގާރަ', 'ބުދަ', 'ބުރާސްފަތި', 'ހުކުރު', 'ހޮނިހިރު'];
  function dvDay(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return m ? DAYS[new Date(+m[1], +m[2] - 1, +m[3]).getDay()] + '، ' : '';
  }
  function dvDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return m ? (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1] : esc(iso || '');
  }
  var today = new Date(); today = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  var tasksEl = document.getElementById('tasks');
  if (tasksEl) {
    var tasks = (T.tasks || []).map(function (t, i) { return Object.assign({ _i: i }, t); });
    // open tasks first, by due date (no date last); finished tasks at the bottom
    tasks.sort(function (a, b) {
      if (!!a.done !== !!b.done) return a.done ? 1 : -1;
      var ad = a.due || '9999', bd = b.due || '9999';
      return ad < bd ? -1 : ad > bd ? 1 : a._i - b._i;
    });
    var openN = tasks.filter(function (t) { return !t.done; }).length;
    var lateN = tasks.filter(function (t) { return !t.done && t.due && t.due < today; }).length;
    tasksEl.innerHTML = tasks.length
      ? '<div class="island-summary">' +
          '<div><strong>' + openN + '</strong><span>ބާކީ</span></div>' +
          '<div><strong class="' + (lateN ? 'late-n' : '') + '">' + lateN + '</strong><span>ލަސްވެފައި</span></div>' +
          '<div><strong>' + (tasks.length - openN) + '</strong><span>ނިމިފައި</span></div></div>' +
        '<div class="task-list">' + tasks.map(function (t) {
          var late = !t.done && t.due && t.due < today;
          return '<div class="task' + (t.done ? ' is-done' : '') + (late ? ' is-late' : '') + '">' +
            '<span class="task-check">' + (t.done ? '✓' : '') + '</span>' +
            '<div class="task-main"><div class="task-title">' + esc(t.task || '—') + '</div>' +
              '<div class="task-meta">' +
                (t.assignee ? '<span>' + ICON.user + esc(t.assignee) + '</span>' : '') +
                (t.due ? '<span class="task-due">' + ICON.clock + dvDate(t.due) + (t.time ? ' · <span dir="ltr">' + esc(t.time) + '</span>' : '') + (late ? ' · ލަސްވެފައި' : '') + '</span>' : '') +
              '</div>' +
              (t.details ? '<p class="task-details">' + esc(t.details).replace(/\n/g, '<br>') + '</p>' : '') +
            '</div></div>';
        }).join('') + '</div>'
      : '<p class="none">' + EMPTY + '</p>';
  }

  /* ---------- Meetings ---------- */
  // Meeting notes: "1. text" lines become numbered points, "- text" lines sub-points under them
  function notes(txt) {
    var head = [], points = [];
    String(txt).split('\n').forEach(function (line) {
      var l = line.trim(); if (!l) return;
      var num = /^(\d+)\.\s*(.*)$/.exec(l), sub = /^[-–•]\s*(.*)$/.exec(l);
      if (num) points.push({ n: num[1], lines: [num[2]], subs: [] });
      else if (!points.length) head.push(l);
      else if (sub) points[points.length - 1].subs.push(sub[1]);
      else points[points.length - 1].lines.push(l);
    });
    return '<div class="notes">' +
      head.map(function (h) { return '<div class="note-head">' + esc(h) + '</div>'; }).join('') +
      points.map(function (p) {
        return '<div class="note"><span class="note-n">' + esc(p.n) + '</span><div class="note-body">' +
          p.lines.map(function (l) { return '<div>' + esc(l) + '</div>'; }).join('') +
          p.subs.map(function (x) { return '<div class="note-sub">' + esc(x) + '</div>'; }).join('') +
          '</div></div>';
      }).join('') + '</div>';
  }
  var mtEl = document.getElementById('meetings');
  if (mtEl) {
    var members = T.members || [];
    // number meetings in date order (1 = first), list newest first
    var meetings = (T.meetings || []).slice().sort(function (a, b) { return (a.date || '') < (b.date || '') ? -1 : 1; })
      .map(function (m, i) { return Object.assign({ _n: i + 1 }, m); }).reverse();
    var PLACE = '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
    function when(m) {
      return m.date ? dvDay(m.date) + dvDate(m.date) + (m.time ? ' <span class="nowrap">· <span dir="ltr">' + esc(m.time) + '</span></span>' : '') : (m.time ? '<span dir="ltr">' + esc(m.time) + '</span>' : '');
    }
    function attendance(m) {
      var att = m.attended || [];
      var names = members.concat(att.filter(function (a) { return members.indexOf(a) < 0; }));
      if (m.date && m.date >= today) return '';
      if (!att.length) return '<h3>ހާޒިރީ</h3><p class="att-none">ހާޒިރީ ނަގާފައެއް ނުވޭ</p>';
      var pct = names.length ? Math.round(att.length / names.length * 100) : 0;
      return '<h3>ހާޒިރީ · <span dir="ltr">' + att.length + '/' + names.length + '</span></h3>' +
        '<div class="att-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="att-chips" style="margin-top:.5rem">' + names.map(function (n) {
          var here = att.indexOf(n) >= 0;
          return '<span class="att' + (here ? ' here' : '') + '">' + (here ? '✓ ' : '') + esc(n) + '</span>';
        }).join('') + '</div>';
    }
    mtEl.innerHTML = meetings.length ? '<div class="meeting-list">' + meetings.map(function (m, i) {
      var upcoming = m.date && m.date >= today;
      return '<div class="mcard' + (upcoming ? ' is-upcoming' : '') + '" role="button" tabindex="0" data-m="' + i + '">' +
        '<span class="mcard-n">' + m._n + '</span>' +
        '<div class="mcard-info"><div class="mcard-title">ބައްދަލުވުން ' + m._n + (upcoming ? ' <span class="up-tag">ކުރިއަށް</span>' : '') + '</div>' +
          '<div class="task-meta"><span>' + ICON.clock + when(m) + '</span>' +
          (m.place ? '<span>' + PLACE + esc(m.place) + '</span>' : '') + '</div></div>' +
        '<span class="mcard-go">‹</span></div>';
    }).join('') + '</div>' : '<p class="none">' + EMPTY + '</p>';
    function meetingSheet(i) {
      var m = meetings[i];
      openSheet('<p class="sheet-kicker">ބައްދަލުވުން ' + m._n + '</p>' +
        '<h2>' + (m.title ? esc(m.title) : 'ބައްދަލުވުން ' + m._n) + '</h2>' +
        '<div class="task-meta" style="margin-bottom:.6rem"><span>' + ICON.clock + when(m) + '</span>' + (m.place ? '<span>' + PLACE + esc(m.place) + '</span>' : '') + '</div>' +
        (m.details ? notes(m.details) : '<p class="none">' + EMPTY + '</p>') +
        attendance(m));
    }
    mtEl.addEventListener('click', function (e) { var c = e.target.closest('.mcard'); if (c) meetingSheet(+c.dataset.m); });
    mtEl.addEventListener('keydown', function (e) {
      var c = e.target.closest('.mcard');
      if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); meetingSheet(+c.dataset.m); }
    });
  }

  /* ---------- Sponsors + gifts ---------- */
  var spEl = document.getElementById('sponsors');
  if (spEl) {
    var sponsors = T.sponsors || [], gifts = T.gifts || [];
    var GIFT = '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M2.5 9h19v-1a1 1 0 0 0-1-1h-17a1 1 0 0 0-1 1zM12 7v13"/><path d="M12 7c-1.5-3-5-3.5-5-1.2C7 7 9.5 7 12 7zm0 0c1.5-3 5-3.5 5-1.2C17 7 14.5 7 12 7z"/></svg>';
    var h = '<h2 class="group-title">ސްޕޮންސަރުން <span class="group-count">' + sponsors.length + '</span></h2>';
    h += sponsors.length ? '<div class="sp-cards">' + sponsors.map(function (s) {
      return '<div class="sp">' +
        '<div class="sp-name">' + esc(s.name || '—') + '</div>' +
        (s.contribution ? '<div class="sp-contrib">' + esc(s.contribution) + '</div>' : '') +
        ((s.contact || s.phone) ? '<div class="sp-contact">' + ICON.user + '<span>' + esc(s.contact || '') + '</span>' +
          (s.phone ? '<a class="call" href="tel:' + esc(String(s.phone).replace(/\s/g, '')) + '">' + ICON.phone + '<span dir="ltr">' + esc(s.phone) + '</span></a>' : '') + '</div>' : '') +
        (s.notes ? '<p class="task-details">' + esc(s.notes).replace(/\n/g, '<br>') + '</p>' : '') +
        '</div>';
    }).join('') + '</div>' : '<p class="none">' + EMPTY + '</p>';
    // gifts split into not-received and received
    function giftCard(g) {
      return '<div class="gift' + (g.received ? ' is-received' : '') + '">' +
        '<span class="task-check">' + (g.received ? '✓' : '') + '</span>' +
        '<span class="gift-icon">' + GIFT + '</span>' +
        '<div class="gift-main"><div class="gift-title">' + esc(g.item || '—') +
          (g.qty ? ' <span class="gift-qty">× ' + esc(g.qty) + '</span>' : '') + '</div>' +
          '<div class="task-meta">' +
            (g.from ? '<span>ސްޕޮންސަރ: ' + esc(g.from) + '</span>' : '<span class="no-sponsor">ސްޕޮންސަރެއް ނުލިބޭ</span>') +
            (g['for'] ? '<span>· ' + esc(g['for']) + '</span>' : '') +
          '</div>' +
          (g.notes ? '<p class="task-details">' + esc(g.notes).replace(/\n/g, '<br>') + '</p>' : '') +
        '</div></div>';
    }
    var giftsOpen = gifts.filter(function (g) { return !g.received; }), giftsDone = gifts.filter(function (g) { return g.received; });
    h += '<h2 class="group-title">ހަދިޔާ</h2>';
    if (!gifts.length) h += '<p class="none">' + EMPTY + '</p>';
    if (giftsOpen.length) h += '<h3 class="gift-group pending">އަދި ނުލިބޭ <span class="group-count">' + giftsOpen.length + '</span></h3><div class="gift-list">' + giftsOpen.map(giftCard).join('') + '</div>';
    if (giftsDone.length) h += '<h3 class="gift-group done">ލިބިފައިވާ <span class="group-count">' + giftsDone.length + '</span></h3><div class="gift-list">' + giftsDone.map(giftCard).join('') + '</div>';
    spEl.innerHTML = h;
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
