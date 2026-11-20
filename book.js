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
  var alvos = $$('.tit, .olho:not(.sem-marca), .lead, .sub, .foto, [data-rev], .barras, .tabela, .num');
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
  var trilhoSec = $('.trilho-sec'), trilho = $('.trilho'), trilhoBarra = $('.trilho-barra'), cartoes = $$('.cartao');
  var parallax = $$('[data-px]'), circulo = $('.foto.circulo'), barra = $('.progresso span');
  var capa = $('.capa');
  var obra = $('.obra'), obraGrupos = $$('.casa [data-e]'), obraEtapas = $$('.etapas li'), obraPct = $('.obra-pct b'), casaSvg = $('.casa');
  var botaoProjeto = $('.modo-projeto');
  function desenhaObra(po) {
    // 5 etapas iguais; cada traco se desenha dentro da sua etapa; as janelas acendem na ultima
    var atual = Math.min(5, Math.floor(po * 5) + 1);
    obraGrupos.forEach(function (g) {
      var e = +g.getAttribute('data-e'), local = limita(po * 5 - (e - 1), 0, 1);
      g.style.setProperty('--d', (1 - local).toFixed(4));
      g.classList.toggle('agora', e === atual && local < 1);
    });
    casaSvg.style.setProperty('--luz', limita(po * 5 - 4.2, 0, 0.8) / 0.8);
    obraEtapas.forEach(function (li) { var e = +li.getAttribute('data-e'); li.classList.toggle('feita', po * 5 >= e); li.classList.toggle('agora', e === atual && po < 1); });
    obraPct.textContent = String(Math.round(po * 100));
  }

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
    botaoProjeto.classList.toggle('mostra', passouCapa);

    if (calmo) { desenhaObra(1); return; }

    // casa se constroi: progresso da secao fixa
    var ro = obra.getBoundingClientRect();
    if (ro.top < vh && ro.bottom > 0) desenhaObra(limita((-ro.top + vh * 0.15) / Math.max(1, ro.height - vh * 0.85), 0, 1));

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
      // carrossel 3D: o cartao do centro fica de frente, os das pontas giram e recuam
      if (rt.top < vh && rt.bottom > 0) {
        var vw = window.innerWidth;
        cartoes.forEach(function (c) {
          var r = c.getBoundingClientRect(), d = limita((r.left + r.width / 2 - vw / 2) / vw, -1.2, 1.2), ad = Math.abs(d);
          c.style.transform = 'perspective(1800px) rotateY(' + (d * -30).toFixed(2) + 'deg) translateZ(' + (-ad * 180).toFixed(1) + 'px)';
          c.style.opacity = (1 - ad * 0.45).toFixed(3);
        });
      }
    } else if (cartoes[0].style.transform) {
      cartoes.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; });
    }

    // parallax suave nas fotos marcadas
    parallax.forEach(function (f) {
      var r = f.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
      f.style.setProperty('--py', (p * parseFloat(f.getAttribute('data-px')) * -r.height).toFixed(1) + 'px');
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

  /* ---------- 3D com o mouse: fotos inclinam com reflexo, capa, cartoes e QR ---------- */
  var mouse = !calmo && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (mouse) {
    // a foto (caixa) escuta o ponteiro e so a imagem de dentro gira: assim o Chrome nao perde o mouse
    $$('.foto').forEach(function (f) {
      if (f.classList.contains('circulo') || f.classList.contains('comparar') || f.closest('.pin')) return;
      var b = document.createElement('span'); b.className = 'brilho'; f.appendChild(b);
      f.addEventListener('pointermove', function (e) {
        var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        f.classList.add('mira');
        f.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
        f.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
        f.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); f.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      f.addEventListener('pointerleave', function () { f.classList.remove('mira'); f.style.setProperty('--ry', '0deg'); f.style.setProperty('--rx', '0deg'); });
    });

    // capa: a foto acompanha o mouse em profundidade e o titulo anda ao contrario
    var capaEl = $('.capa'), tilt = $('.capa-tilt'), titCapa = $('.capa-tit');
    capaEl.addEventListener('pointermove', function (e) {
      var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      tilt.style.setProperty('--ty', (x * 5).toFixed(2) + 'deg'); tilt.style.setProperty('--tx', (-y * 4).toFixed(2) + 'deg');
      tilt.style.setProperty('--px', (x * -18).toFixed(1) + 'px'); tilt.style.setProperty('--pv', (y * -12).toFixed(1) + 'px');
      titCapa.style.transform = 'translate3d(' + (x * 10).toFixed(1) + 'px,' + (y * 6).toFixed(1) + 'px,0)';
    });
    capaEl.addEventListener('pointerleave', function () { ['--ty', '--tx', '--px', '--pv'].forEach(function (v) { tilt.style.setProperty(v, '0'); }); titCapa.style.transform = ''; });

    // cartoes do financiamento e QR: o grupo escuta e so o cartao sob o mouse inclina
    var grupoTilt = function (grupo, itens, forca, aplica) {
      grupo.addEventListener('pointermove', function (e) {
        itens.forEach(function (it) {
          var r = it.getBoundingClientRect(), dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          var x = dentro ? (e.clientX - r.left) / r.width - 0.5 : 0, y = dentro ? (e.clientY - r.top) / r.height - 0.5 : 0;
          aplica(it, x * forca, -y * forca, dentro);
        });
      });
      grupo.addEventListener('pointerleave', function () { itens.forEach(function (it) { aplica(it, 0, 0, false); }); });
    };
    grupoTilt($('.financia-cartoes'), $$('.vira'), 14, function (it, ry, rx, dentro) {
      if (!it.classList.contains('visivel')) return;
      it.style.transition = 'transform .5s cubic-bezier(.2,.75,.1,1), box-shadow .5s';
      it.style.transform = dentro ? 'perspective(900px) rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg) translateZ(18px)' : '';
      it.style.boxShadow = dentro ? '0 30px 60px -20px rgba(0,0,0,.7)' : '';
    });
    var qr = $('.qr-giro');
    grupoTilt($('.fale-claro'), [$('.qr')], 30, function (it, ry, rx) { qr.style.setProperty('--qy', ry.toFixed(2) + 'deg'); qr.style.setProperty('--qx', rx.toFixed(2) + 'deg'); });
  }

  /* ---------- fogo da capa: a chama da foto ondula, a luz tremula e as faiscas sobem ---------- */
  (function () {
    var telaB = $('.brasas'), telaC = $('.chama'), telaL = $('.luz');
    if (!telaB || calmo) return;
    var foto = $('.capa-zoom img'), caixa = $('.capa-zoom');
    var cB = telaB.getContext('2d'), cC = telaC.getContext('2d'), cL = telaL.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    // posicoes em fracao da foto inteira (medidas com grade): chama de x .505 a .548, y .652 a .744
    var CHAMA = { x0: 0.498, y0: 0.628, x1: 0.556, y1: 0.742 };
    var BOCA = { x0: 0.506, x1: 0.547, y: 0.700, topo: 0.655 };
    var W = 0, H = 0, esc = 1, ox = 0, oy = 0, iw = 1672, ih = 941;
    var cw = 0, ch = 0, sx = 0, sy = 0, sw = 0, sh = 0;
    var faiscas = [], vivo = true, ultimo = 0, proxRajada = 0, vento = 0;

    // ruido suave: soma de senos com fases diferentes (barato e sem repeticao visivel)
    var ruido = function (t, k) { return Math.sin(t * 0.0013 * k + 1.7) * 0.5 + Math.sin(t * 0.0031 * k + 4.1) * 0.3 + Math.sin(t * 0.0077 * k) * 0.2; };

    // a foto em alta, carregada a parte: com srcset o naturalWidth da <img> vem "corrigido" e nao serve para recortar
    var alta = new Image(), altaOk = false;
    alta.decoding = 'async';
    alta.onload = function () { altaOk = true; mede(); };
    alta.src = 'fotos/lareira.webp';
    function mede() {
      W = caixa.offsetWidth; H = caixa.offsetHeight; if (!W || !H || !altaOk) return;
      iw = alta.naturalWidth; ih = alta.naturalHeight;
      esc = Math.max(W / iw, H / ih); ox = (W - iw * esc) / 2; oy = (H - ih * esc) / 2;
      [[telaB, cB], [telaL, cL]].forEach(function (par) { par[0].width = Math.round(W * dpr); par[0].height = Math.round(H * dpr); par[1].setTransform(dpr, 0, 0, dpr, 0, 0); });
      // area da chama em pixels da tela e da foto original
      var x = ox + CHAMA.x0 * iw * esc, y = oy + CHAMA.y0 * ih * esc;
      cw = (CHAMA.x1 - CHAMA.x0) * iw * esc; ch = (CHAMA.y1 - CHAMA.y0) * ih * esc;
      telaC.style.left = x + 'px'; telaC.style.top = y + 'px'; telaC.style.width = cw + 'px'; telaC.style.height = ch + 'px';
      telaC.width = Math.round(cw * dpr); telaC.height = Math.round(ch * dpr);
      sx = CHAMA.x0 * iw; sy = CHAMA.y0 * ih; sw = (CHAMA.x1 - CHAMA.x0) * iw; sh = (CHAMA.y1 - CHAMA.y0) * ih;
      // recorte da chama uma vez so, numa tela pequena com folga dos lados (as faixas andam para os lados)
      folga = Math.round(sw * 0.15);
      fonte.width = Math.round(sw) + folga * 2; fonte.height = Math.round(sh);
      fonte.getContext('2d').drawImage(alta, sx - folga, sy, fonte.width, fonte.height, 0, 0, fonte.width, fonte.height);
    }
    var fonte = document.createElement('canvas'), folga = 0;    var px = function (fx) { return ox + fx * iw * esc; }, py = function (fy) { return oy + fy * ih * esc; };

    // 1. a chama da propria foto, redesenhada em faixas que ondulam e esticam para cima
    function desenhaChama(t, forca) {
      var Wc = telaC.width, Hc = telaC.height; if (!Wc) return;
      cC.globalCompositeOperation = 'source-over';
      cC.clearRect(0, 0, Wc, Hc);
      var faixa = Math.max(2, Math.round(2 * dpr)), fonteFaixa = sh * faixa / Hc;
      var ampl = Wc * 0.032 * (0.75 + forca * 0.55);
      var estica = 0.012 + 0.01 * forca;                         // as linguas sobem um pouco, sem mexer a pedra
      var fw = fonte.width - folga * 2, fh = fonte.height, fsx = fw / Wc;
      for (var j = 0; j < Hc; j += faixa) {
        var v = j / Hc;                                         // 0 no alto, 1 na base
        var k = v < 0.8 ? Math.pow(Math.sin(Math.min(1, v / 0.8) * Math.PI * 0.5), 0.5) : Math.max(0, (1 - v) / 0.2) * 0.8;
        var dx = (Math.sin(v * 9 - t * 0.0105) + 0.6 * Math.sin(v * 23 + t * 0.017) + 0.35 * Math.sin(v * 47 - t * 0.031)) * ampl * k * (1.15 - v * 0.5);
        var vs = v + Math.sin(t * 0.006 + v * 7) * estica * k * (1 - v);
        var fy = Math.max(0, Math.min(fh - fonteFaixa, vs * fh));
        cC.drawImage(fonte, folga - dx * fsx, fy, fw, fonteFaixa, 0, j, Wc, faixa);
      }
      // borda macia em elipse: so o miolo aparece, nada de quadro visivel
      cC.globalCompositeOperation = 'destination-in';
      cC.save(); cC.translate(Wc * 0.5, Hc * 0.6); cC.scale(1, Hc / Wc);
      var g = cC.createRadialGradient(0, 0, 0, 0, 0, Wc * 0.5);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.62, 'rgba(0,0,0,1)'); g.addColorStop(0.86, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      cC.fillStyle = g; cC.fillRect(-Wc, -Wc, Wc * 2, Wc * 2); cC.restore();
      cC.globalCompositeOperation = 'source-over';
    }

    // 2. a luz do fogo tremulando no ambiente (sofas, piso, pergolado)
    function desenhaLuz(forca) {
      cL.clearRect(0, 0, W, H);
      var cx = px(0.527), cy = py(0.69), raio = Math.max(W, H) * (0.5 + forca * 0.05);
      var g = cL.createRadialGradient(cx, cy, 0, cx, cy, raio);
      g.addColorStop(0, 'rgba(255,170,90,0)');
      g.addColorStop(0.07, 'rgba(255,170,90,' + (0.12 + forca * 0.22).toFixed(3) + ')');
      g.addColorStop(0.3, 'rgba(255,140,60,' + (0.08 + forca * 0.16).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(40,20,10,0)');
      cL.fillStyle = g; cL.fillRect(0, 0, W, H);
    }

    // 3. faiscas com rastro, esfriando do branco ao vermelho
    function nasce(rajada) {
      var x = px(BOCA.x0 + Math.random() * (BOCA.x1 - BOCA.x0)), y = py(BOCA.topo + Math.random() * (BOCA.y - BOCA.topo));
      var forca = (rajada ? 1.35 : 1) * Math.max(0.55, esc * 1.15);
      return { x: x, y: y, ax: x, ay: y, vx: (Math.random() - 0.5) * 0.7 * forca, vy: -(0.45 + Math.random() * 1.0) * forca, vida: 0, max: 30 + Math.random() * (rajada ? 70 : 50), r: (0.6 + Math.random() * 0.9) * Math.max(0.7, forca), fase: Math.random() * 6.28 };
    }
    function desenhaFaiscas(t) {
      cB.clearRect(0, 0, W, H);
      if (Math.random() < 0.22) faiscas.push(nasce(false));
      if (t > proxRajada) { for (var n = 0; n < 5 + Math.random() * 8; n++) faiscas.push(nasce(true)); proxRajada = t + 1800 + Math.random() * 3200; }
      vento += (ruido(t, 0.7) * 0.35 - vento) * 0.02;
      cB.globalCompositeOperation = 'lighter'; cB.lineCap = 'round';
      for (var i = faiscas.length - 1; i >= 0; i--) {
        var p = faiscas[i]; p.vida++;
        p.ax = p.x; p.ay = p.y;
        p.vx += vento * 0.05 + Math.sin(p.fase + p.vida * 0.21) * 0.06;
        p.vx *= 0.985; p.vy *= 0.982; p.vy -= 0.006;
        p.x += p.vx; p.y += p.vy;
        var a = 1 - p.vida / p.max;
        if (a <= 0 || p.y < -20) { faiscas.splice(i, 1); continue; }
        var cor = a > 0.75 ? '255,214,140' : a > 0.4 ? '255,150,50' : '220,70,20';
        var piscar = 0.6 + 0.4 * Math.sin(p.vida * 0.9 + p.fase);
        cB.strokeStyle = 'rgba(' + cor + ',' + (a * piscar * 0.9).toFixed(3) + ')';
        cB.lineWidth = p.r * (0.45 + a * 0.6);
        cB.beginPath(); cB.moveTo(p.ax - p.vx * 0.7, p.ay - p.vy * 0.7); cB.lineTo(p.x, p.y); cB.stroke();
        if (a > 0.65) { cB.fillStyle = 'rgba(255,190,110,' + ((a - 0.65) * 0.45).toFixed(3) + ')'; cB.beginPath(); cB.arc(p.x, p.y, p.r * 2, 0, 6.283); cB.fill(); }
      }
      if (faiscas.length > 220) faiscas.splice(0, faiscas.length - 220);
      cB.globalCompositeOperation = 'source-over';
    }

    function anima(t) {
      if (!vivo) { ultimo = 0; return; }
      requestAnimationFrame(anima);
      if (t - ultimo < 15) return; ultimo = t;
      if (!altaOk) return;
      if (!W) mede();
      var forca = Math.max(0, Math.min(1, 0.55 + ruido(t, 1) * 0.35 + (Math.random() - 0.5) * 0.12));
      desenhaChama(t, forca);
      desenhaLuz(forca);
      desenhaFaiscas(t);
    }
    requestAnimationFrame(anima);
    window.addEventListener('resize', mede);
    new IntersectionObserver(function (es) { vivo = es[0].isIntersecting; if (vivo && !ultimo) requestAnimationFrame(anima); }).observe(telaB);
  })();

  /* ---------- do terreno ao Villagio: arrastar entre projeto e realidade ---------- */
  (function () {
    var fig = $('.comparar'); if (!fig) return;
    var alca = $('.comparar-alca', fig), arrastando = false, mexeu = false;
    var poe = function (pct) { pct = limita(pct, 0, 100); fig.style.setProperty('--corte', pct.toFixed(2) + '%'); alca.setAttribute('aria-valuenow', String(Math.round(pct))); };
    var pelo = function (x) { var r = fig.getBoundingClientRect(); poe((x - r.left) / r.width * 100); };
    fig.addEventListener('pointerdown', function (e) { arrastando = true; mexeu = true; pelo(e.clientX); try { fig.setPointerCapture(e.pointerId); } catch (x) { /* sem captura */ } });
    fig.addEventListener('pointermove', function (e) { if (arrastando || (e.pointerType === 'mouse' && mouse)) { mexeu = true; pelo(e.clientX); } });
    ['pointerup', 'pointercancel'].forEach(function (ev) { fig.addEventListener(ev, function () { arrastando = false; }); });
    // dedo arrastando de lado: le pelo toque, para nao brigar com a rolagem da pagina
    fig.addEventListener('touchmove', function (e) { if (arrastando) pelo(e.touches[0].clientX); }, { passive: true });
    alca.addEventListener('keydown', function (e) {
      var v = parseFloat(fig.style.getPropertyValue('--corte')) || 50;
      if (e.key === 'ArrowLeft') { poe(v - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { poe(v + 5); e.preventDefault(); }
    });
    // na primeira vez que aparece: mostra o projeto inteiro e revela a realidade
    if (!calmo && 'IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; io2.disconnect();
        var t0 = performance.now();
        (function anda(t) {
          if (mexeu) return;
          var p = limita((t - t0) / 2600, 0, 1), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          poe(p < 0.55 ? 100 - (e / 0.605) * 90 : 10 + (p - 0.55) / 0.45 * 40);
          if (p < 1) requestAnimationFrame(anda);
        })(t0);
      }, { threshold: 0.5 });
      io2.observe(fig);
    }
  })();

  /* ---------- som da lareira: crepitar e passarinhos gerados pelo navegador (sem arquivo) ---------- */
  (function () {
    var botao = $('.som'); if (!botao) return;
    var Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) { botao.hidden = true; return; }
    var ac = null, mestre, ruidoBranco, ligado = false, visivel = true, timers = [];
    function cria() {
      ac = new Ctx();
      mestre = ac.createGain(); mestre.gain.value = 0; mestre.connect(ac.destination);
      // rugido baixo do fogo: ruido marrom em laco
      var n = ac.sampleRate * 4, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0), ult = 0;
      for (var i = 0; i < n; i++) { var w = Math.random() * 2 - 1; ult = (ult + 0.02 * w) / 1.02; d[i] = ult * 3.2; }
      var fonte = ac.createBufferSource(); fonte.buffer = buf; fonte.loop = true;
      var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
      var g = ac.createGain(); g.gain.value = 0.42;
      fonte.connect(lp); lp.connect(g); g.connect(mestre); fonte.start();
      // ruido branco curto para os estalos
      var m = Math.round(ac.sampleRate * 0.08); ruidoBranco = ac.createBuffer(1, m, ac.sampleRate);
      var r = ruidoBranco.getChannelData(0); for (var k = 0; k < m; k++) r[k] = Math.random() * 2 - 1;
    }
    function estalo(forte) {
      var t = ac.currentTime, s = ac.createBufferSource(); s.buffer = ruidoBranco;
      var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400 + Math.random() * 4200; bp.Q.value = 0.8 + Math.random() * 2.5;
      var g = ac.createGain(), pico = (forte ? 0.5 : 0.12) * (0.4 + Math.random()), dur = 0.006 + Math.random() * (forte ? 0.05 : 0.025);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pico, t + 0.0015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(mestre); s.start(t); s.stop(t + dur + 0.02);
    }
    function piu(t, f0, sobe) {
      var o = ac.createOscillator(), g = ac.createGain(), dur = 0.05 + Math.random() * 0.09;
      o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * (sobe ? 1.35 : 0.72), t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(mestre); o.start(t); o.stop(t + dur + 0.02);
    }
    function canto() {
      var t = ac.currentTime + 0.05, f = 2600 + Math.random() * 1800, notas = 2 + Math.floor(Math.random() * 5);
      for (var i = 0; i < notas; i++) piu(t + i * (0.09 + Math.random() * 0.07), f * (0.9 + Math.random() * 0.25), Math.random() < 0.6);
    }
    function agenda() {
      timers.forEach(clearTimeout); timers = [];
      var crepita = function () { if (!ligado || !visivel) return; var rajada = Math.random() < 0.12; estalo(Math.random() < 0.25); if (rajada) for (var i = 0; i < 3; i++) setTimeout(function () { estalo(false); }, 20 + Math.random() * 90); timers.push(setTimeout(crepita, 40 + Math.random() * 260)); };
      var passaro = function () { if (!ligado || !visivel) return; canto(); timers.push(setTimeout(passaro, 2500 + Math.random() * 5500)); };
      crepita(); timers.push(setTimeout(passaro, 1200));
    }
    function volume(v) { var t = ac.currentTime; mestre.gain.cancelScheduledValues(t); mestre.gain.setValueAtTime(mestre.gain.value, t); mestre.gain.linearRampToValueAtTime(v, t + 1.2); }
    botao.addEventListener('click', function () {
      if (!ac) cria();
      ligado = !ligado;
      botao.setAttribute('aria-pressed', ligado ? 'true' : 'false');
      $('span', botao).textContent = ligado ? 'Desligar o som' : 'Ligar o som';
      if (ligado) { ac.resume(); volume(0.9); agenda(); } else { volume(0); timers.forEach(clearTimeout); }
    });
    // o som acompanha a capa: some quando a pessoa rola para baixo e volta ao subir
    new IntersectionObserver(function (es) {
      visivel = es[0].isIntersecting;
      if (!ac || !ligado) return;
      if (visivel) { volume(0.9); agenda(); } else volume(0);
    }, { threshold: 0.15 }).observe($('.capa'));
  })();

  /* ---------- modo projeto: todas as fotos viram desenho tecnico ---------- */
  (function () {
    var botao = $('.modo-projeto'), varre = $('.varredura'); if (!botao) return;
    var NOMES = 'lareira sala-jantar piscina vista centro-comercial redario gourmet coworking playground pet-place mountain academia ambiente-integrado jantar-estar painel-tv cozinha dormitorio-casal quarto-verde dormitorio-solteiro quarto-infantil'.split(' ');
    var nomeDe = function (src) { var m = /fotos\/(?:mini\/)?([a-z-]+)\.webp/.exec(src || ''); return m && NOMES.indexOf(m[1]) >= 0 ? m[1] : null; };
    var ligado = false;
    function troca() {
      $$('img').forEach(function (im) {
        if (im.closest('.comparar-projeto')) return;
        if (ligado) {
          var nome = nomeDe(im.getAttribute('src')); if (!nome) return;
          im.dataset.src = im.getAttribute('src'); if (im.getAttribute('srcset')) { im.dataset.srcset = im.getAttribute('srcset'); im.removeAttribute('srcset'); }
          im.src = 'fotos/projeto/' + nome + '.webp';
        } else if (im.dataset.src) {
          if (im.dataset.srcset) im.setAttribute('srcset', im.dataset.srcset);
          im.src = im.dataset.src; delete im.dataset.src; delete im.dataset.srcset;
        }
      });
      $$('.lanterna').forEach(function (l) {
        var orig = l.dataset.foto || l.style.getPropertyValue('--foto'); l.dataset.foto = orig;
        var nome = nomeDe(orig);
        l.style.setProperty('--foto', ligado && nome ? 'url(fotos/projeto/' + nome + '.webp)' : orig);
      });
      document.body.classList.toggle('projeto', ligado);
    }
    botao.addEventListener('click', function () {
      ligado = !ligado;
      botao.setAttribute('aria-pressed', ligado ? 'true' : 'false');
      $('span', botao).textContent = ligado ? 'Ver fotos' : 'Modo projeto';
      if (calmo) { troca(); return; }
      varre.classList.remove('corre'); void varre.offsetWidth; varre.classList.add('corre');
      setTimeout(troca, 500);
    });
  })();

  /* ---------- lanterna nas paginas escuras: o ponteiro revela uma foto escondida ---------- */
  (function () {
    var secoes = $$('.tem-lanterna'); if (!secoes.length) return;
    secoes.forEach(function (s) {
      var l = $('.lanterna', s), ultimoToque = 0, alvoX = 0.5, alvoY = 0.5, x = 0.5, y = 0.5, vivo = false;
      var aponta = function (cx, cy) { var r = s.getBoundingClientRect(); alvoX = (cx - r.left) / r.width; alvoY = (cy - r.top) / r.height; ultimoToque = performance.now(); };
      s.addEventListener('pointermove', function (e) { aponta(e.clientX, e.clientY); });
      s.addEventListener('touchmove', function (e) { aponta(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      s.addEventListener('touchstart', function (e) { aponta(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      function anima(t) {
        if (!vivo) return;
        requestAnimationFrame(anima);
        // sem ninguem mexendo, a luz passeia sozinha devagar
        if (t - ultimoToque > 2500) { alvoX = 0.5 + Math.sin(t / 2300) * 0.32; alvoY = 0.5 + Math.sin(t / 1700 + 1) * 0.28; }
        x += (alvoX - x) * 0.09; y += (alvoY - y) * 0.09;
        l.style.setProperty('--lx', (x * 100).toFixed(2) + '%'); l.style.setProperty('--ly', (y * 100).toFixed(2) + '%');
      }
      if (calmo) return;
      new IntersectionObserver(function (es) { var antes = vivo; vivo = es[0].isIntersecting; if (vivo && !antes) requestAnimationFrame(anima); }).observe(s);
    });
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
    if (!alvo || alvo.classList.contains('comparar') || e.target.closest('a, button')) return;
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
