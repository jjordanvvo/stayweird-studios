/* Stay Weird Studios — shared layout, cart and product cards. Plain JS, no build step. */
(function () {
  const S = window.SW_SETTINGS, P = window.SW_PRODUCTS, C = window.SW_COLLECTIONS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = (n) => "$" + n.toFixed(2);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = (id) => P.find((p) => p.id === id);

  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 4v16M4 12h16"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Zm5-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".9" fill="currentColor"/></svg>'
  };
  window.SW_ICONS = I;

  /* ---------- Images & product cards ---------- */
  function imgCount(p) { return p.images && p.images.length ? p.images.length : p.placeholderCount || 1; }
  function media(p, i = 0, extra = "") {
    const src = p.images && p.images[i];
    const cls = "ph" + (i % 2 ? " ph--2" : "") + (extra ? " " + extra : "");
    return src ? `<div class="${cls}"><img src="${esc(src)}" alt="${esc(p.name)}" loading="lazy"></div>` : `<div class="${cls}">Image ${i + 1}</div>`;
  }
  const soldOut = (p) => p.sizes.every((s) => p.soldOut.includes(s));
  function priceHTML(p) {
    return p.compareAt ? `<span class="sale">${money(p.price)}</span><span class="was">${money(p.compareAt)}</span>` : money(p.price);
  }
  function dots(n) { return n > 1 ? `<div class="dots">${Array.from({ length: n }, (_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>` : ""; }

  function card(p) {
    const n = imgCount(p), out = soldOut(p);
    const badge = out ? '<span class="badge badge--dark">Sold out</span>' : p.compareAt ? '<span class="badge">Sale</span>' : "";
    const qa = out ? "" : `<button class="plus" data-plus aria-label="Quick add ${esc(p.name)}">${I.plus}</button>
      <div class="qa"><div class="qa__top"><span>Select size</span><button data-qa-close aria-label="Close">${I.close}</button></div>
      <div class="qa__sizes">${p.sizes.map((s) => `<button data-add="${p.id}" data-size="${esc(s)}" ${p.soldOut.includes(s) ? "disabled" : ""}>${esc(s)}</button>`).join("")}</div></div>`;
    return `<div class="card" data-card="${p.id}"><div class="card__top">
      <a class="card__media" href="/product?id=${encodeURIComponent(p.id)}" aria-label="${esc(p.name)}">
        <div class="slides" data-slides>${Array.from({ length: n }, (_, i) => media(p, i)).join("")}</div>${dots(n)}${badge}
      </a>${qa}</div>
      <a class="card__info" href="/product?id=${encodeURIComponent(p.id)}"><div class="card__name">${esc(p.name)}</div><div class="card__price">${priceHTML(p)}</div></a>
    </div>`;
  }
  Object.assign(window, { SW_card: card, SW_media: media, SW_price: priceHTML, SW_dots: dots, SW_imgCount: imgCount, SW_money: money, SW_esc: esc, SW_soldOut: soldOut });

  /* ---------- Cart (saved in this browser) ---------- */
  const KEY = "sw_cart";
  let cart = [];
  try { cart = (JSON.parse(localStorage.getItem(KEY)) || []).filter((l) => byId(l.id)); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} renderCart(); }
  function add(id, size, qty = 1, open = true) {
    const l = cart.find((x) => x.id === id && x.size === size);
    if (l) l.qty += qty; else cart.push({ id, size, qty });
    save();
    if (open) openPanel("cart");
  }
  window.SW_addToCart = add;

  function renderCart() {
    const count = cart.reduce((n, l) => n + l.qty, 0);
    $$("[data-count]").forEach((el) => (el.textContent = count));
    const body = $("#cart-body"), foot = $("#cart-foot");
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty"><p>Your cart is empty</p><a class="btn" href="/shop">Continue shopping</a></div>`;
      foot.hidden = true;
      return;
    }
    const sub = cart.reduce((n, l) => n + byId(l.id).price * l.qty, 0);
    const left = Math.max(0, S.freeShipping - sub);
    const pct = Math.min(100, (sub / S.freeShipping) * 100);
    const ship = `<div class="ship">${left ? `You're ${money(left)} away from <b>free shipping</b>` : "You've unlocked <b>free shipping</b>"}
      <div class="ship__bar"><div class="ship__fill" style="width:${pct}%"></div><div class="ship__tag ${left ? "" : "done"}">${I.tag}</div></div><div class="ship__label">Free Shipping</div></div>`;
    const lines = cart.map((l, i) => {
      const p = byId(l.id);
      return `<div class="line"><a href="/product?id=${p.id}">${media(p, 0, "thumb")}</a>
        <div><div class="line__name">${esc(p.name)}</div><div class="line__meta">Size: ${esc(l.size)}</div>
          <div class="qty"><button data-dec="${i}" aria-label="Decrease">−</button><span>${l.qty}</span><button data-inc="${i}" aria-label="Increase">+</button></div></div>
        <div class="line__right"><button data-rm="${i}" aria-label="Remove">${I.trash}</button><span>${money(p.price * l.qty)}</span></div></div>`;
    }).join("");
    // "Complete the fit": suggest something from the other category that isn't in the cart
    const inCart = new Set(cart.map((l) => l.id));
    const wantsBottoms = cart.some((l) => byId(l.id).collections.includes("tops"));
    const pool = P.filter((p) => !inCart.has(p.id) && !soldOut(p));
    const rec = pool.find((p) => p.collections.includes(wantsBottoms ? "bottoms" : "tops")) || pool[0];
    const fit = rec ? `<div class="fit"><div class="fit__title">Complete the fit</div><div class="fit__item">
        <a href="/product?id=${rec.id}">${media(rec, 0, "thumb")}</a>
        <div><div class="line__name">${esc(rec.name)}</div><div>${money(rec.price)}</div>
        <div class="fit__row"><select id="fit-size" aria-label="Size">${rec.sizes.filter((s) => !rec.soldOut.includes(s)).map((s) => `<option>${esc(s)}</option>`).join("")}</select>
        <button data-fit="${rec.id}">Add to cart</button></div></div></div></div>` : "";
    body.innerHTML = ship + lines + fit;
    foot.hidden = false;
    $("#cart-sub").textContent = money(sub);
    $("#checkout").textContent = "Checkout • " + money(sub);
  }

  /* ---------- Layout ---------- */
  const shopLinks = C.filter((c) => c.id !== "new-items").map((c) => [c.name, "/shop?c=" + c.id]);
  function layout() {
    const ann = `<div class="ann" role="region" aria-label="Announcements">${S.announcements.map((t, i) => `<div class="ann__slide ${i ? "" : "on"}">${esc(t)}</div>`).join("")}</div>`;
    const header = `<header class="header" id="header">
      <div class="header__left">
        <button class="icon only-sm" data-open="menu" aria-label="Open menu">${I.menu}</button>
        <button class="icon only-sm" data-open="search" aria-label="Open search">${I.search}</button>
        <div class="dd only-lg"><a class="nav-link nav-link--bold" href="/shop">Shop</a>
          <div class="dd__panel">${shopLinks.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</div></div>
        <a class="nav-link only-lg" href="/shop?c=new-items">New Items</a>
        <button class="nav-link only-lg" data-open="search">${I.search}Search</button>
      </div>
      <a class="logo" href="/">${esc(S.brand)}</a>
      <div class="header__right">
        <a class="nav-link only-lg" href="/contact">${I.user}Account</a>
        <a class="icon only-sm" href="/contact" aria-label="Account">${I.user}</a>
        <button class="cart-btn icon" data-open="cart" aria-label="Cart">${I.bag}<span class="only-lg" data-count>0</span></button>
      </div>
    </header>
    <div class="search" id="panel-search" role="dialog" aria-label="Search">
      <div class="search__row">${I.search}<input id="search-input" type="search" placeholder="Search..." autocomplete="off" aria-label="Search"><button data-close aria-label="Close search">${I.close}</button></div>
      <div class="search__results" id="search-results"></div><p class="search__none" id="search-none"></p>
    </div>`;
    const panels = `<div class="overlay" id="overlay" data-close></div>
      <aside class="drawer drawer--menu mmenu" id="panel-menu" aria-label="Menu">
        <div class="mmenu__head"><div><button class="x-btn" data-close aria-label="Close menu">${I.close}</button></div><a class="logo" href="/" style="font-size:26px">${esc(S.brand)}</a><div></div></div>
        <div class="mmenu__body">
          <details><summary>Shop ${I.down}</summary>${shopLinks.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</details>
          <a class="mmenu__link" href="/shop?c=new-items">New Items</a>
          <a class="mmenu__link" href="/contact">Account</a>
        </div>
      </aside>
      <aside class="drawer drawer--cart" id="panel-cart" aria-label="Cart">
        <div class="cart__head"><span class="logo">${esc(S.brand)}</span><button class="cart__close" data-close aria-label="Close cart">${I.close}</button></div>
        <div class="cart__body" id="cart-body"></div>
        <div class="cart__foot" id="cart-foot" hidden>
          <div class="cart__sub"><span>Subtotal</span><span id="cart-sub"></span></div>
          <button class="btn btn--case" id="checkout">Checkout</button>
          <div class="pay"><span>Apple Pay</span><span>G Pay</span><span>PayPal</span><span>AMEX</span><span>VISA</span><span>Mastercard</span><span>Shop Pay</span></div>
        </div>
      </aside>
      <div class="toast" id="toast" role="status"></div>`;
    const acc = (title, links) => `<details><summary>${title}${I.down}</summary><ul>${links.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></details>`;
    const footer = `<section class="news">
        <h2>Get 20% off</h2><p>Join the Community</p>
        <form id="news-form"><input type="email" required placeholder="Enter your email" aria-label="Email"><button type="submit">Join</button></form>
        <div class="news__msg" id="news-msg" role="status"></div>
      </section>
      <footer class="footer">
        ${acc("Customer Service", [["Contact Us", "/contact"], ["Shipping & Returns", "/shipping"], ["Size Guide", "/size-guide"]])}
        ${acc("Menu", [...shopLinks, ["New Items", "/shop?c=new-items"], ["About", "/about"]])}
        ${acc("Policies", [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Refund Policy", "/shipping"]])}
        <div class="footer__bottom"><a href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a><span>© ${new Date().getFullYear()} ${esc(S.brand)}</span></div>
      </footer>`;
    document.body.insertAdjacentHTML("afterbegin", ann + header + panels);
    document.body.insertAdjacentHTML("beforeend", footer);
  }

  /* ---------- Panels ---------- */
  let current = null;
  function openPanel(name) {
    closePanel();
    const el = $("#panel-" + name);
    if (!el) return;
    current = el;
    el.classList.add("open");
    if (name === "search") { setTimeout(() => $("#search-input").focus(), 60); updateHeader(); return; }
    $("#overlay").classList.add("open");
    document.body.classList.add("lock");
  }
  function closePanel() {
    if (current) current.classList.remove("open");
    current = null;
    $("#overlay").classList.remove("open");
    document.body.classList.remove("lock");
    updateHeader();
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2400);
  }
  window.SW_toast = toast;

  /* Header: see-through over the homepage hero, hides on scroll down, returns on scroll up */
  let lastY = 0, hovering = false;
  function updateHeader() {
    const h = $("#header"), y = window.scrollY;
    const hero = document.body.classList.contains("has-hero");
    h.classList.toggle("clear", hero && y < 10 && !hovering);
    h.classList.toggle("hide", y > 120 && y > lastY && !current);
  }

  function bind() {
    document.addEventListener("click", (e) => {
      const t = e.target;
      const o = t.closest("[data-open]"); if (o) { e.preventDefault(); openPanel(o.dataset.open); return; }
      if (t.closest("[data-close]")) { closePanel(); return; }
      const plus = t.closest("[data-plus]");
      if (plus) {
        e.preventDefault();
        const c = plus.closest(".card"), p = byId(c.dataset.card);
        if (p.sizes.length === 1) { add(p.id, p.sizes[0]); return; }
        $$(".card.qa-open").forEach((x) => x !== c && x.classList.remove("qa-open"));
        c.classList.toggle("qa-open");
        return;
      }
      if (t.closest("[data-qa-close]")) { t.closest(".card").classList.remove("qa-open"); return; }
      const a = t.closest("[data-add]");
      if (a) { e.preventDefault(); a.closest(".card")?.classList.remove("qa-open"); add(a.dataset.add, a.dataset.size); return; }
      const inc = t.closest("[data-inc]"), dec = t.closest("[data-dec]"), rm = t.closest("[data-rm]"), fit = t.closest("[data-fit]");
      if (inc) { cart[+inc.dataset.inc].qty++; save(); }
      if (dec) { const i = +dec.dataset.dec; if (--cart[i].qty < 1) cart.splice(i, 1); save(); }
      if (rm) { cart.splice(+rm.dataset.rm, 1); save(); }
      if (fit) add(fit.dataset.fit, $("#fit-size").value);
      if (t.id === "checkout") toast("Checkout will connect once the store backend is set up");
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanel(); });

    // Image dots follow the swipe position (product cards + product page gallery)
    document.addEventListener("scroll", (e) => {
      const s = e.target;
      if (!(s instanceof Element) || !s.matches("[data-slides]")) return;
      const i = Math.round(s.scrollLeft / s.clientWidth);
      const d = s.parentElement.querySelector(".dots") || s.parentElement.parentElement.querySelector(".dots");
      if (d) [...d.children].forEach((x, j) => x.classList.toggle("on", j === i));
    }, true);

    $("#search-input").addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      const res = q ? P.filter((p) => p.name.toLowerCase().includes(q) || p.collections.some((c) => c.includes(q))) : [];
      $("#search-results").innerHTML = res.map(card).join("");
      $("#search-none").textContent = q && !res.length ? `No results for “${q}”` : "";
    });

    $("#news-form").addEventListener("submit", (e) => {
      e.preventDefault();
      $("#news-msg").textContent = "Thanks for joining! Check your inbox for your code.";
      e.target.reset();
    });

    const h = $("#header");
    h.addEventListener("mouseenter", () => { hovering = true; updateHeader(); });
    h.addEventListener("mouseleave", () => { hovering = false; updateHeader(); });
    window.addEventListener("scroll", () => { updateHeader(); lastY = window.scrollY; }, { passive: true });

    // Announcement rotation (every 5s, pauses on hover)
    const slides = $$(".ann__slide");
    if (slides.length > 1) {
      let i = 0, paused = false;
      $(".ann").addEventListener("mouseenter", () => (paused = true));
      $(".ann").addEventListener("mouseleave", () => (paused = false));
      setInterval(() => {
        if (paused) return;
        const out = slides[i]; i = (i + 1) % slides.length; const inn = slides[i];
        out.classList.remove("on"); out.classList.add("out"); inn.classList.add("on");
        setTimeout(() => { out.classList.add("snap"); out.classList.remove("out"); void out.offsetWidth; out.classList.remove("snap"); }, 550);
      }, 5000);
    }
  }

  layout();
  bind();
  renderCart();
  updateHeader();
})();
