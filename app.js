(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- WhatsApp ---------------- */
  const waLink = (msg) => `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(msg)}`;
  const openWa = (msg) => window.open(waLink(msg), "_blank", "noopener");
  $$(".js-wa").forEach((a) => {
    a.href = waLink(a.dataset.msg || "Olá!");
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------------- Info da loja ---------------- */
  $("#infoEndereco").textContent = LOJA.endereco;
  $("#infoHorario").textContent = LOJA.horario;
  $("#infoInsta").href = LOJA.instagram;
  $("#year").textContent = new Date().getFullYear();

  /* ---------------- Desenhos das peças ---------------- */
  const SHAPES = {
    camiseta: (c, a) => `<path d="M70 40 50 48 25 75l17 17 16-12v85h84V80l16 12 17-17-25-27-20-8q-30 20-60 0z" fill="${c}"/><path d="M70 40q30 20 60 0" fill="none" stroke="${a}" stroke-width="2"/>`,
    polo: (c, a) => `<path d="M70 40 50 48 25 75l17 17 16-12v85h84V80l16 12 17-17-25-27-20-8-14 16H84z" fill="${c}"/><path d="m84 56 16 20 16-20" fill="none" stroke="${a}" stroke-width="2"/><circle cx="100" cy="86" r="2" fill="${a}"/><circle cx="100" cy="96" r="2" fill="${a}"/>`,
    camisa: (c, a) => `<path d="M72 38 48 46 30 120l16 4 14-46v90h80V78l14 46 16-4-18-74-24-8-28 24z" fill="${c}"/><path d="M100 62v106" stroke="${a}" stroke-width="1.5"/><path d="m72 38 28 24 28-24" fill="none" stroke="${a}" stroke-width="1.5"/>${[80, 100, 120, 140].map((y) => `<circle cx="104" cy="${y}" r="1.8" fill="${a}"/>`).join("")}`,
    bermuda: (c, a) => `<path d="M58 50h84l8 92h-42l-8-48-8 48H50z" fill="${c}"/><path d="M58 62h84" stroke="${a}" stroke-width="1.5"/><path d="M100 62v30" stroke="${a}" stroke-width="1.5"/>`,
    calca: (c, a) => `<path d="M64 26h72l6 150h-32l-10-96-10 96H58z" fill="${c}"/><path d="M64 38h72" stroke="${a}" stroke-width="1.5"/><path d="M100 38v40" stroke="${a}" stroke-width="1.5"/>`,
    bone: (c, a) => `<path d="M48 120q0-62 52-64 52 2 52 64z" fill="${c}"/><path d="M38 120h138q6 14-16 16l-122-4z" fill="${c}"/><path d="M100 56v64" stroke="${a}" stroke-width="1.5"/><circle cx="100" cy="56" r="4" fill="${a}"/>`,
    carteira: (c, a) => `<rect x="40" y="60" width="120" height="84" rx="10" fill="${c}"/><path d="M40 86h120" stroke="${a}" stroke-width="1.5"/><rect x="120" y="96" width="40" height="22" rx="6" fill="none" stroke="${a}" stroke-width="1.5"/><path d="M48 68h104M48 136h104" stroke="${a}" stroke-width="1" stroke-dasharray="3 4"/>`,
  };
  const luminance = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  function art(p) {
    if (p.foto) return `<div class="card-art"><img src="${p.foto}" alt="${p.nome}" loading="lazy"/></div>`;
    const light = luminance(p.cor) > 0.55;
    const bg = light
      ? "radial-gradient(circle at 50% 35%,#3a3833,#151515 75%)"
      : "radial-gradient(circle at 50% 35%,#f7f2e9,#d9d0c0 80%)";
    const accent = light ? "#c9a96e" : "rgba(255,255,255,.35)";
    const shape = (SHAPES[p.tipo] || SHAPES.camiseta)(p.cor, accent);
    return `<div class="card-art" style="background:${bg}"><svg viewBox="0 0 200 200" aria-hidden="true">${shape}</svg></div>`;
  }

  /* ---------------- Marcas ---------------- */
  const track = $("#brandsTrack");
  track.innerHTML = [...MARCAS, ...MARCAS].map((m) => `<span class="brand">${m}</span>`).join("");

  /* ---------------- Filtros + grid ---------------- */
  let catAtual = "todos";
  let busca = "";
  const filtersEl = $("#filters");
  filtersEl.innerHTML = CATEGORIAS.map(
    (c) => `<button class="chip${c.id === "todos" ? " active" : ""}" data-cat="${c.id}">${c.nome}</button>`
  ).join("");
  filtersEl.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    setCat(b.dataset.cat);
  });
  function setCat(id) {
    catAtual = id;
    $$(".chip", filtersEl).forEach((c) => c.classList.toggle("active", c.dataset.cat === id));
    renderGrid();
  }
  $("#search").addEventListener("input", (e) => {
    busca = e.target.value.trim().toLowerCase();
    renderGrid();
  });
  $$(".cat-tile").forEach((t) =>
    t.addEventListener("click", () => setCat(t.dataset.cat))
  );

  const grid = $("#grid");
  function renderGrid() {
    const lista = PRODUTOS.filter((p) => {
      const okCat = catAtual === "todos" || p.categoria === catAtual;
      const okBusca = !busca || `${p.nome} ${p.marca} ${p.categoria}`.toLowerCase().includes(busca);
      return okCat && okBusca;
    });
    $("#empty").hidden = lista.length > 0;
    grid.innerHTML = lista
      .map((p) => {
        const off = p.precoAntigo ? Math.round((1 - p.preco / p.precoAntigo) * 100) : 0;
        return `<article class="card" data-id="${p.id}">
          <div class="card-media" data-cursor="Ver">
            ${art(p)}
            <div class="card-glare"></div>
            ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ""}
            ${off ? `<span class="card-tag sale">-${off}%</span>` : ""}
            <button class="card-quick" type="button">Escolher tamanho</button>
          </div>
          <div class="card-info">
            <p class="card-brand">${p.marca}</p>
            <h3 class="card-name">${p.nome}</h3>
            <p class="price">${brl(p.preco)} ${p.precoAntigo ? `<s>${brl(p.precoAntigo)}</s>` : ""}</p>
          </div>
        </article>`;
      })
      .join("");
    $$(".card", grid).forEach((card, i) => {
      setTimeout(() => card.classList.add("in"), 60 * i);
      card.addEventListener("click", () => openModal(+card.dataset.id));
      bindTilt($(".card-media", card), 12, true);
    });
    bindCursorTargets();
  }

  /* ---------------- Tilt 3D ---------------- */
  function bindTilt(el, max = 10, glare = false, target = el) {
    if (!finePointer || reduceMotion || !el) return;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      target.classList.add("tilting");
      target.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
      target.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
      if (glare) {
        target.style.setProperty("--gx", `${x * 100}%`);
        target.style.setProperty("--gy", `${y * 100}%`);
      }
    });
    el.addEventListener("mouseleave", () => {
      target.classList.remove("tilting");
      target.style.setProperty("--rx", "0deg");
      target.style.setProperty("--ry", "0deg");
    });
  }
  const aboutV = $(".about-visual");
  bindTilt(aboutV, 14, false, $(".about-frame"));

  /* Spotlight que segue o mouse */
  function bindSpot(el) {
    if (!finePointer) return;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  }
  $$(".how-step, .contact-card").forEach(bindSpot);
  $$(".cat-tile").forEach((el) => {
    if (!finePointer) return;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--y", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });

  /* ---------------- Hero: spotlight + parallax ---------------- */
  const hero = $(".hero");
  const depthEls = $$("[data-depth]", hero);
  if (finePointer && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
    function loop() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      depthEls.forEach((el) => {
        const d = parseFloat(el.dataset.depth);
        const isWord = el.classList.contains("word");
        // as palavras do título já animaram a entrada; só aplicamos translate após a animação
        if (isWord && !el.dataset.ready) return;
        el.style.transform = `translate3d(${cx * d * 24}px, ${cy * d * 24}px, 0)`;
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    $$(".hero-title .word").forEach((w) =>
      w.addEventListener("animationend", () => {
        w.style.animation = "none";
        w.style.transform = "translate3d(0,0,0)";
        w.dataset.ready = "1";
      })
    );
  }

  /* ---------------- Cursor personalizado ---------------- */
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");
  const label = $(".cursor-label");
  function bindCursorTargets() {
    if (!finePointer) return;
    $$("a, button, .chip, .size, input, [data-cursor]").forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "1";
      el.addEventListener("mouseenter", () => {
        if (el.dataset.cursor) {
          label.textContent = el.dataset.cursor;
          ring.classList.add("label");
        } else ring.classList.add("hover");
      });
      el.addEventListener("mouseleave", () => ring.classList.remove("hover", "label"));
    });
  }
  if (finePointer) {
    document.body.classList.add("has-cursor");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
    });
    addEventListener("mousedown", () => ring.classList.add("down"));
    addEventListener("mouseup", () => ring.classList.remove("down"));
    document.addEventListener("mouseleave", () => { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.addEventListener("mouseenter", () => { dot.style.opacity = ""; ring.style.opacity = ""; });
    (function follow() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)${ring.classList.contains("down") ? " scale(.8)" : ""}`;
      requestAnimationFrame(follow);
    })();
  }

  /* ---------------- Botões magnéticos ---------------- */
  function bindMagnetic(el) {
    if (!finePointer || reduceMotion || el.dataset.magBound) return;
    el.dataset.magBound = "1";
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
      el.style.transform = "";
      setTimeout(() => (el.style.transition = ""), 600);
    });
  }
  $$("[data-magnetic]").forEach(bindMagnetic);

  /* ---------------- Header / menu ---------------- */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 30);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const menuBtn = $("#menuBtn"), nav = $("#nav");
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("open");
    nav.classList.toggle("open");
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", () => {
    menuBtn.classList.remove("open");
    nav.classList.remove("open");
  }));

  /* ---------------- Reveal + contadores ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      $$("[data-count]", en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));
  function countUp(el) {
    const end = +el.dataset.count;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 1600);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------------- Sacola ---------------- */
  const KEY = "gm_sacola";
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { bag = []; }
  const saveBag = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (_) {} };

  function renderBag() {
    const count = bag.reduce((s, i) => s + i.qtd, 0);
    const cEl = $("#bagCount");
    cEl.textContent = count;
    cEl.classList.toggle("show", count > 0);
    const items = $("#bagItems");
    if (!bag.length) {
      items.innerHTML = `<div class="bag-empty"><strong>Sua sacola está vazia</strong>Escolha suas peças na coleção.</div>`;
    } else {
      items.innerHTML = bag
        .map((i, idx) => {
          const p = PRODUTOS.find((x) => x.id === i.id);
          if (!p) return "";
          return `<div class="bag-item">
            <div class="bag-thumb">${art(p)}</div>
            <div><h4>${p.nome}</h4><p>${p.marca} · Tam. ${i.tam} · Qtd. ${i.qtd}</p><p class="bi-price">${brl(p.preco * i.qtd)}</p></div>
            <button class="bag-remove" data-idx="${idx}">Remover</button>
          </div>`;
        })
        .join("");
    }
    const total = bag.reduce((s, i) => {
      const p = PRODUTOS.find((x) => x.id === i.id);
      return s + (p ? p.preco * i.qtd : 0);
    }, 0);
    $("#bagTotal").textContent = brl(total);
    bindCursorTargets();
  }
  $("#bagItems").addEventListener("click", (e) => {
    const b = e.target.closest(".bag-remove");
    if (!b) return;
    bag.splice(+b.dataset.idx, 1);
    saveBag();
    renderBag();
  });

  const drawer = $("#drawer");
  const openDrawer = () => { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); };
  const closeDrawer = () => { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); };
  $("#bagBtn").addEventListener("click", openDrawer);
  $$("[data-close-drawer]").forEach((b) => b.addEventListener("click", closeDrawer));

  $("#checkout").addEventListener("click", () => {
    if (!bag.length) { toast("Adicione peças à sacola primeiro"); return; }
    let total = 0;
    const linhas = bag.map((i) => {
      const p = PRODUTOS.find((x) => x.id === i.id);
      if (!p) return "";
      total += p.preco * i.qtd;
      return `• ${i.qtd}x ${p.nome} (${p.marca}) — Tam. ${i.tam} — ${brl(p.preco * i.qtd)}`;
    }).filter(Boolean);
    const msg = `Olá, ${LOJA.nome}! Vim pelo site e tenho interesse nestas peças:\n\n${linhas.join("\n")}\n\nTotal estimado: ${brl(total)}\n\nPodem confirmar a disponibilidade?`;
    openWa(msg);
  });

  /* ---------------- Modal de produto ---------------- */
  const modal = $("#modal");
  let atual = null, tam = null, qtd = 1;
  function openModal(id) {
    atual = PRODUTOS.find((p) => p.id === id);
    if (!atual) return;
    tam = atual.tamanhos.length === 1 ? atual.tamanhos[0] : null;
    qtd = 1;
    $("#mVisual").innerHTML = art(atual);
    $("#mBrand").textContent = atual.marca;
    $("#mName").textContent = atual.nome;
    $("#mPrice").innerHTML = `${brl(atual.preco)}${atual.precoAntigo ? `<s>${brl(atual.precoAntigo)}</s>` : ""}`;
    $("#mSizes").innerHTML = atual.tamanhos
      .map((t) => `<button type="button" class="size${t === tam ? " active" : ""}" data-t="${t}">${t}</button>`)
      .join("");
    $("#qVal").textContent = qtd;
    $("#mWarn").hidden = true;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    bindCursorTargets();
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    ring.classList.remove("hover", "label");
  }
  $$("[data-close]", modal).forEach((b) => b.addEventListener("click", closeModal));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal(); closeDrawer(); }
  });
  $("#mSizes").addEventListener("click", (e) => {
    const b = e.target.closest(".size");
    if (!b) return;
    tam = b.dataset.t;
    $$(".size", $("#mSizes")).forEach((s) => s.classList.toggle("active", s === b));
    $("#mWarn").hidden = true;
  });
  $("#qMinus").addEventListener("click", () => { qtd = Math.max(1, qtd - 1); $("#qVal").textContent = qtd; });
  $("#qPlus").addEventListener("click", () => { qtd = Math.min(20, qtd + 1); $("#qVal").textContent = qtd; });
  const mv = $("#mVisual");
  if (finePointer && !reduceMotion) {
    mv.addEventListener("mousemove", (e) => {
      const r = mv.getBoundingClientRect();
      const a = $(".card-art", mv);
      if (!a) return;
      a.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 18}deg`);
      a.style.setProperty("--rx", `${(0.5 - (e.clientY - r.top) / r.height) * 18}deg`);
    });
    mv.addEventListener("mouseleave", () => {
      const a = $(".card-art", mv);
      if (a) { a.style.setProperty("--rx", "0deg"); a.style.setProperty("--ry", "0deg"); }
    });
  }
  const precisaTam = () => {
    if (tam) return true;
    $("#mWarn").hidden = false;
    return false;
  };
  $("#mAdd").addEventListener("click", () => {
    if (!precisaTam()) return;
    const ex = bag.find((i) => i.id === atual.id && i.tam === tam);
    if (ex) ex.qtd += qtd; else bag.push({ id: atual.id, tam, qtd });
    saveBag();
    renderBag();
    const c = $("#bagCount");
    c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
    closeModal();
    toast(`${atual.nome} adicionada à sacola`);
  });
  $("#mBuy").addEventListener("click", () => {
    if (!precisaTam()) return;
    openWa(`Olá, ${LOJA.nome}! Vim pelo site e tenho interesse em:\n\n• ${qtd}x ${atual.nome} (${atual.marca}) — Tam. ${tam} — ${brl(atual.preco * qtd)}\n\nTem disponível?`);
  });

  /* ---------------- Toast ---------------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------------- Início ---------------- */
  renderGrid();
  renderBag();
  bindCursorTargets();
})();
