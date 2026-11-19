/* Villagio Caucaia II | book digital: animacoes, indice, lazer, trilho, brasas e lupa. Sem bibliotecas. */
(function () {
  'use strict';
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var celular = function () { return window.innerWidth <= 900; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var limita = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- titulos: letras da capa e palavras dos demais ---------- */
  $$('.capa-tit .linha').forEach(function (linha) {
    var i = 0;
    (function anda(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (f) {
        if (f.nodeType === 3) {
          var frag = document.createDocumentFragment();
          f.textContent.split('').forEach(function (ch) {
            if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span'); s.className = 'letra'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
            s.style.setProperty('--i', String(i++)); frag.appendChild(s);
          });
          no.replaceChild(frag, f);
        } else if (f.nodeType === 1) anda(f);
      });
    })(linha);
  });
  var capaLetras = $$('.capa-tit .letra');
  capaLetras.forEach(function (s, k) { s.style.setProperty('--i', String(k)); });

  $$('.tit').forEach(function (t) {
    var i = 0;
    (function anda(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (f) {
        if (f.nodeType === 3) {
          var frag = document.createDocumentFragment();
          f.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var fora = document.createElement('span'); fora.className = 'pal';
            var dentro = document.createElement('span'); dentro.textContent = p; dentro.style.setProperty('--i', String(i++));
            fora.appendChild(dentro); frag.appendChild(fora);
          });
          no.replaceChild(frag, f);
        } else if (f.nodeType === 1 && !f.classList.contains('pal')) anda(f);
      });
    })(t);
  });

  /* ---------- atraso em cascata dos itens de cada grupo ---------- */
  ['.destaques', '.grade-num', '.tags', '.financia-cartoes', '.tabela', '.contatos'].forEach(function (g) {
    $$(g).forEach(function (grupo) { $$('[data-rev]', grupo).forEach(function (el, k) { el.style.setProperty('--i', String(k)); }); });
  });

  /* ---------- numeros que contam ---------- */
  var fmt = function (v, casas) { return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }); };
  function conta(el) {
    var alvo = parseFloat(el.getAttribute('data-conta')), casas = parseInt(el.getAttribute('data-casas') || '0', 10);
    if (calmo) { el.textContent = fmt(alvo, casas); return; }
    var t0 = performance.now(), dur = alvo > 20 ? 1900 : 1300;
    (function passo(t) {
      var p = limita((t - t0) / dur, 0, 1), e = 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(p >= 1 ? alvo : alvo * e, casas);
      if (p < 1) requestAnimationFrame(passo);
    })(t0);
  }
  function digita(el) {
    var txt = el.getAttribute('data-digita'); if (calmo) { el.textContent = txt; return; }
    el.textContent = ''; var k = 0;
    var id = setInterval(function () { k++; el.textContent = txt.slice(0, k); if (k >= txt.length) clearInterval(id); }, 170);
  }
  $$('[data-conta]').forEach(function (el) { if (!calmo) el.textContent = fmt(0, parseInt(el.getAttribute('data-casas') || '0', 10)); });

  /* ---------- aparecer ao entrar na tela ---------- */
  var alvos = $$('.tit, .olho:not(.sem-marca), .lead, .sub, .foto, [data-rev], .barras, .tabela');
  var ao = function (el) {
    el.classList.add('visivel');
    $$('[data-conta]', el).forEach(conta);
    if (el.hasAttribute('data-conta')) conta(el);
    $$('[data-digita]', el).forEach(digita);
  };
  if (calmo || !('IntersectionObserver' in window)) alvos.forEach(ao);
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { ao(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    alvos.forEach(function (el) { io.observe(el); });
  }

  /* ---------- indice lateral e contador do celular ---------- */
  var paginas = $$('.pag[data-pag]');
  var lista = $('.indice ol');
  var links = paginas.map(function (p) {
    var li = document.createElement('li'), a = document.createElement('a');
    a.href = '#' + p.id; a.innerHTML = '<span>' + p.getAttribute('data-nome') + '</span>' + p.getAttribute('data-pag') + '<i></i>';
    a.setAttribute('aria-label', 'Página ' + p.getAttribute('data-pag') + ': ' + p.getAttribute('data-nome'));
    li.appendChild(a); lista.appendChild(li); return a;
  });
  var indice = $('.indice'), contador = $('.contador'), flutua = $('.flutua');
  var atual = -1;
  function marca(k) {
    if (k === atual) return; atual = k;
    links.forEach(function (a, j) { a.classList.toggle('ativo', j === k); if (j === k) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    var p = paginas[k];
    indice.classList.toggle('no-escuro', p.classList.contains('escuro') || p.classList.contains('centro') || p.classList.contains('fale') || p.classList.contains('capa'));
    $('b', contador).textContent = p.getAttribute('data-pag');
    $('em', contador).textContent = p.getAttribute('data-nome');
  }

  /* ---------- lazer: troca de foto ---------- */
  var botoes = $$('.lazer-lista button'), palco = $('.lazer-palco'), legLazer = $('.lazer-leg'), grande = $('.lazer-grande');
  var imgsLazer = {};
  botoes.forEach(function (b) {
    var f = b.getAttribute('data-foto');
    if (imgsLazer[f]) return;
    var im = new Image(); im.alt = b.textContent.replace(/^\d+/, '').trim(); im.decoding = 'async'; im.loading = 'lazy';
    im.src = 'fotos/' + (celular() ? 'mini/' : '') + f + '.webp';
    palco.appendChild(im); imgsLazer[f] = im;
  });
  var lazerK = -1, lazerAuto = null, lazerParado = 0;
  function lazerVai(k) {
    if (k === lazerK) return;
    var b = botoes[k], f = b.getAttribute('data-foto');
    botoes.forEach(function (x, j) { x.classList.toggle('ativo', j === k); x.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
    var antes = palco.querySelector('img.ativa'), nova = imgsLazer[f];
    if (antes !== nova) {
      $$('img.saindo', palco).forEach(function (i) { i.classList.remove('saindo'); });
      if (antes) { antes.classList.remove('ativa'); antes.classList.add('saindo'); }
      nova.classList.remove('saindo'); void nova.offsetWidth; nova.classList.add('ativa');
    }
    legLazer.textContent = b.getAttribute('data-leg');
    grande.textContent = b.querySelector('b').textContent;
    grande.classList.remove('troca'); void grande.offsetWidth; grande.classList.add('troca');
    lazerK = k;
  }
  botoes.forEach(function (b, k) {
    var vai = function () { lazerParado = Date.now(); lazerVai(k); };
    b.addEventListener('click', vai);
    b.addEventListener('mouseenter', function () { if (!celular()) vai(); });
    b.addEventListener('focus', vai);
  });
  lazerVai(0);
  if (!calmo && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        clearInterval(lazerAuto);
        if (e.isIntersecting) lazerAuto = setInterval(function () { if (Date.now() - lazerParado > 7000) lazerVai((lazerK + 1) % botoes.length); }, 2600);
      });
    }, { threshold: 0.35 }).observe($('.lazer'));
  }

  /* ---------- centro comercial, trilho, parallax, circulo e progresso (rolagem) ---------- */
  var centro = $('.centro'), lojas = $$('.lojas i'), acesas = $('.acesas b');
  var trilhoSec = $('.trilho-sec'), trilho = $('.trilho'), trilhoBarra = $('.trilho-barra');
  var parallax = $$('[data-px]'), circulo = $('.foto.circulo'), barra = $('.progresso span');
  var capa = $('.capa');

  function medeTrilho() {
    if (celular() || calmo) { trilhoSec.style.height = ''; trilho.style.transform = ''; return; }
    var extra = trilho.scrollWidth - window.innerWidth;
    trilhoSec.style.height = (window.innerHeight + Math.max(0, extra)) + 'px';
  }

  var pedido = false;
  function quadro() {
    pedido = false;
    var vh = window.innerHeight, y = window.scrollY, total = document.documentElement.scrollHeight - vh;
    barra.style.transform = 'scaleX(' + (total > 0 ? y / total : 0) + ')';

    // pagina atual: a que cobre o meio da tela
    var meio = vh * 0.5, k = 0;
    for (var i = 0; i < paginas.length; i++) { var r = paginas[i].getBoundingClientRect(); if (r.top <= meio) k = i; }
    marca(k);
    var passouCapa = capa.getBoundingClientRect().bottom < vh * 0.4;
    flutua.classList.toggle('mostra', passouCapa);
    contador.classList.toggle('mostra', passouCapa);

    if (calmo) return;

    // centro comercial: zoom saindo e lojas acendendo
    var rc = centro.getBoundingClientRect();
    var pc = limita(-rc.top / Math.max(1, rc.height - vh), 0, 1);
    centro.style.setProperty('--p', pc.toFixed(4));
    var n = Math.round(limita((pc - 0.08) / 0.7, 0, 1) * 8);
    lojas.forEach(function (l, j) { l.classList.toggle('acesa', j < n); });
    acesas.textContent = String(n);

    // trilho horizontal
    if (!celular()) {
      var rt = trilhoSec.getBoundingClientRect();
      var pt = limita(-rt.top / Math.max(1, rt.height - vh), 0, 1);
      var extra = Math.max(0, trilho.scrollWidth - window.innerWidth);
      trilho.style.transform = 'translate3d(' + (-pt * extra).toFixed(1) + 'px,0,0)';
      trilhoBarra.style.setProperty('--p', pt.toFixed(4));
    }

    // parallax suave nas fotos marcadas
    parallax.forEach(function (f) {
      var r = f.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
      var img = f.querySelector('img');
      img.style.setProperty('--py', (p * parseFloat(f.getAttribute('data-px')) * -r.height).toFixed(1) + 'px');
    });

    // circulo do dormitorio abre conforme a foto sobe na tela
    if (circulo) {
      var rr = circulo.getBoundingClientRect();
      var pr = limita((vh - rr.top) / (vh * 0.95), 0, 1);
      circulo.style.setProperty('--p', pr.toFixed(4));
    }
  }
  var pede = function () { if (!pedido) { pedido = true; requestAnimationFrame(quadro); } };
  window.addEventListener('scroll', pede, { passive: true });
  window.addEventListener('resize', function () { medeTrilho(); pede(); });
  window.addEventListener('load', function () { medeTrilho(); pede(); });
  medeTrilho(); quadro();

  /* ---------- fotos que inclinam com o mouse ---------- */
  if (!calmo && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.foto.inclina').forEach(function (f) {
      f.addEventListener('pointermove', function (e) {
        var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        f.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); f.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
      });
      f.addEventListener('pointerleave', function () { f.style.setProperty('--ry', '0deg'); f.style.setProperty('--rx', '0deg'); });
    });
  }

  /* ---------- brasas subindo da lareira na capa ---------- */
  (function () {
    var tela = $('.brasas'); if (!tela || calmo) return;
    var foto = $('.capa-zoom img'), ctx = tela.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, fx = 0, fy = 0, esc = 1, parts = [], vivo = true, ultimo = 0;
    var FOGO = { x: 0.523, y: 0.655, larg: 0.07 };   // ponto da chama na foto inteira (fracao)
    function mede() {
      var r = tela.getBoundingClientRect(); W = r.width; H = r.height;
      tela.width = Math.round(W * dpr); tela.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var iw = foto.naturalWidth || 1672, ih = foto.naturalHeight || 941;
      esc = Math.max(W / iw, H / ih);
      fx = (W - iw * esc) / 2 + FOGO.x * iw * esc; fy = (H - ih * esc) / 2 + FOGO.y * ih * esc;
    }
    function nasce() {
      var larg = FOGO.larg * 1672 * esc;
      return { x: fx + (Math.random() - 0.5) * larg, y: fy + (Math.random() - 0.3) * 10, vx: (Math.random() - 0.5) * 0.35, vy: -(0.55 + Math.random() * 1.1), vida: 0, max: 90 + Math.random() * 140, r: 0.8 + Math.random() * 1.9, fase: Math.random() * 6.28 };
    }
    function anima(t) {
      if (!vivo) { ultimo = 0; return; }
      requestAnimationFrame(anima);
      if (t - ultimo < 15) return; ultimo = t;
      ctx.clearRect(0, 0, W, H);
      // brilho da chama pulsando
      var pulso = 0.5 + 0.18 * Math.sin(t / 130) + 0.1 * Math.sin(t / 47);
      var g = ctx.createRadialGradient(fx, fy - 6, 0, fx, fy - 6, 120 * esc * 2.2);
      g.addColorStop(0, 'rgba(255,170,70,' + (0.32 * pulso).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (parts.length < 70) parts.push(nasce());
      ctx.globalCompositeOperation = 'lighter';
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.vida++;
        p.x += p.vx + Math.sin(p.fase + p.vida / 18) * 0.35; p.y += p.vy; p.vy *= 0.997;
        var a = 1 - p.vida / p.max;
        if (a <= 0) { parts.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.6 + a * 0.6), 0, 6.283);
        ctx.fillStyle = 'rgba(255,' + Math.round(140 + a * 90) + ',' + Math.round(50 + a * 40) + ',' + (a * 0.9).toFixed(3) + ')';
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    if (foto.complete) mede(); else foto.addEventListener('load', mede);
    window.addEventListener('resize', mede);
    new IntersectionObserver(function (es) { vivo = es[0].isIntersecting; if (vivo && !ultimo) requestAnimationFrame(anima); }).observe(tela);
    mede(); requestAnimationFrame(anima);
  })();

  /* ---------- lupa: qualquer foto abre grande, com setas e toque ---------- */
  var lupa = $('.lupa'), lupaImg = $('img', lupa), lupaLeg = $('.lupa-leg', lupa);
  var fotos = [], vistos = {};
  $$('img[data-legenda]').forEach(function (im) {
    var arq = im.getAttribute('src').replace('mini/', '');
    if (vistos[arq]) return; vistos[arq] = 1;
    fotos.push({ src: arq, leg: im.getAttribute('data-legenda'), alt: im.alt });
  });
  var lupaK = 0;
  function mostra(k) {
    lupaK = (k + fotos.length) % fotos.length; var f = fotos[lupaK];
    lupaImg.src = f.src; lupaImg.alt = f.alt; lupaLeg.textContent = f.leg + '  ·  ' + (lupaK + 1) + ' / ' + fotos.length;
    lupaImg.style.animation = 'none'; void lupaImg.offsetWidth; lupaImg.style.animation = '';
  }
  function abre(src) {
    var k = 0; fotos.forEach(function (f, j) { if (f.src === src) k = j; });
    mostra(k);
    if (typeof lupa.showModal === 'function') lupa.showModal(); else lupa.setAttribute('open', '');
  }
  document.addEventListener('click', function (e) {
    var alvo = e.target.closest('.foto, .centro-foto, .lazer-foto');
    if (!alvo || e.target.closest('a, button')) return;
    var im = alvo.classList.contains('lazer-foto') ? palco.querySelector('img.ativa') : alvo.querySelector('img');
    if (im) abre(im.getAttribute('src').replace('mini/', ''));
  });
  $('.lupa-fecha').addEventListener('click', function () { lupa.close(); });
  $('.lupa-ant').addEventListener('click', function () { mostra(lupaK - 1); });
  $('.lupa-prox').addEventListener('click', function () { mostra(lupaK + 1); });
  lupa.addEventListener('click', function (e) { if (e.target === lupa) lupa.close(); });
  document.addEventListener('keydown', function (e) {
    if (!lupa.open) return;
    if (e.key === 'ArrowRight') mostra(lupaK + 1);
    if (e.key === 'ArrowLeft') mostra(lupaK - 1);
  });
  var x0 = null;
  lupa.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lupa.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) mostra(lupaK + (dx < 0 ? 1 : -1));
  });
})();
