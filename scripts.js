/* CRIA 500 — progressive enhancement; content and checkout work without JS. */
(() => {
  document.documentElement.classList.add('js');
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = $('.site-nav');
  const toggle = $('.menu-toggle');
  const sticky = $('#sticky-cta');
  const hero = $('.hero');
  const offer = $('.offer-card');
  const final = $('#final-cta');
  const summary = $('.offer-summary');
  const dialog = $('#media-dialog');
  const player = $('#example-player');
  let returnFocus = null;
  let closing = false;

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    updateSticky();
  }
  toggle.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    updateSticky();
  });
  menu.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', (event) => {
    if (menu.classList.contains('is-open') && !event.target.closest('.header-inner')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
  });
  matchMedia('(min-width: 651px)').addEventListener('change', (event) => { if (event.matches) closeMenu(); });

  // Only below-the-fold elements are hidden for reveal; the hero is always in HTML.
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({target, isIntersecting}) => {
        if (!isIntersecting) return;
        target.dataset.reveal = 'shown';
        observer.unobserve(target);
      });
    }, {rootMargin:'0px 0px -30px 0px', threshold:0.08});
    $$('.reveal').forEach((element) => {
      if (element.getBoundingClientRect().top < innerHeight) return;
      element.dataset.reveal = 'waiting';
      observer.observe(element);
    });
    reduced.addEventListener('change', (event) => {
      if (!event.matches) return;
      observer.disconnect();
      $$('.reveal').forEach((element) => { delete element.dataset.reveal; });
    });
  }

  const cards = $$('.video-card');
  const filters = $$('.gallery-filters button');
  const more = $('#gallery-more');
  const counter = $('.gallery-counter');
  let activeFilter = 'all';
  let expanded = false;
  $('.gallery-filters').hidden = false;
  $('.video-grid').id = 'video-grid';
  more.setAttribute('aria-controls', 'video-grid');
  function renderGallery() {
    const matches = cards.filter((card) => activeFilter === 'all' || card.dataset.category === activeFilter);
    const limit = activeFilter === 'all' && !expanded ? 4 : matches.length;
    cards.forEach((card) => { card.hidden = !matches.slice(0,limit).includes(card); });
    const visible = Math.min(limit, matches.length);
    counter.textContent = visible === matches.length ? `${visible} exemplo${visible===1?'':'s'}` : `${visible} de ${matches.length} exemplos`;
    more.hidden = activeFilter !== 'all' || matches.length <= 4;
    more.setAttribute('aria-expanded', String(expanded));
    more.innerHTML = `${expanded ? 'Mostrar menos' : 'Ver mais exemplos'} <svg class="icon" aria-hidden="true"><use href="#i-${expanded?'close':'plus'}"></use></svg>`;
  }
  filters.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach((item) => {item.classList.toggle('is-active',item===button);item.setAttribute('aria-pressed',String(item===button));});
    renderGallery();
  }));
  more.addEventListener('click', () => {
    expanded = !expanded;
    renderGallery();
    if (!expanded) more.scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});
  });
  renderGallery();

  const peek=$('.personalizer-peek');
  const narrow=matchMedia('(max-width: 650px)');
  if(peek){
    const adjustPeek=()=>{peek.open=!narrow.matches;};
    adjustPeek();narrow.addEventListener('change',adjustPeek);
  }

  async function closeVideo() {
    if (!dialog.open || closing) return;
    closing = true;
    player.pause();
    if (!reduced.matches && dialog.animate) {
      await $('.media-shell').animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(25px) scale(.95)'}],{duration:200,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
    }
    dialog.close();
  }
  $$('.video-open').forEach((link) => link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    returnFocus = link;
    closing = false;
    $('.media-shell').getAnimations().forEach((animation) => animation.cancel());
    $('#media-title').textContent = link.dataset.title;
    $('.media-status').hidden = true;
    $('#media-fallback').href = link.href;
    player.poster = link.querySelector('img').src;
    player.src = link.dataset.video;
    dialog.showModal();
    document.body.classList.add('modal-is-open');
    updateSticky();
    $('#media-close').focus({preventScroll:true});
    player.play().catch(() => { /* Native controls allow playback if autoplay is blocked. */ });
  }));
  $('#media-close').addEventListener('click', closeVideo);
  dialog.addEventListener('cancel', (event) => {event.preventDefault();closeVideo();});
  dialog.addEventListener('click', (event) => {if (event.target===dialog) closeVideo();});
  dialog.addEventListener('close', () => {
    player.pause();player.removeAttribute('src');player.load();
    document.body.classList.remove('modal-is-open');closing=false;
    updateSticky();
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  });
  player.addEventListener('error', () => {if(dialog.open && player.hasAttribute('src')) $('.media-status').hidden=false;});
  document.addEventListener('visibilitychange', () => {if(document.hidden) player.pause();});

  const exposure = new Map([[hero,true],[offer,false],[final,false],[summary,false]]);
  function updateSticky() {
    sticky.hidden = exposure.get(hero) || exposure.get(offer) || exposure.get(final) || exposure.get(summary)
      || menu.classList.contains('is-open') || Boolean(document.querySelector('dialog[open]')) || document.body.classList.contains('coupon-is-open');
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => exposure.set(entry.target,entry.isIntersecting));updateSticky();
    },{threshold:0});
    [hero,offer,final,summary].filter(Boolean).forEach((element) => observer.observe(element));
  }
  document.addEventListener('cria:coupon-change',updateSticky);
  document.addEventListener('cria:modal-change',updateSticky);
})();

(() => {
    const productionHosts = ["cria.club", "www.cria.club", "cria300.vercel.app"];
    if (productionHosts.includes(window.location.hostname.toLowerCase()) && !window.__criaPixelInitialized) {
      window.__criaPixelInitialized = true;
      if (!window.fbq) {
        const fbq = function () {
          if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
          else fbq.queue.push(arguments);
        };
        window.fbq = fbq;
        if (!window._fbq) window._fbq = fbq;
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = "2.0";
        fbq.queue = [];
        const pixelScript = document.createElement("script");
        pixelScript.async = true;
        pixelScript.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(pixelScript);
      }
      window.fbq("init", "1509642039730970");
      window.fbq("track", "PageView");
    }
})();

/* ── COUPON POPUP: presentation only; capture contract preserved below. ── */
(function () {
  const STORAGE_KEY = "cria_lead_captured";
  const SUPABASE_URL = "https://ulapqyoltznvpbygvvik.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsYXBxeW9sdHpudnBieWd2dmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5OTE5NjIsImV4cCI6MjEwNDU2Nzk2Mn0.OC4IZqEWeivNDrWNrigUwhZ00_rPTXle7LvTqs2Ii1E";

  const SESSION_KEY = "cria_coupon_dismissed";
  const readFlag = (storage, key) => {
    try { return Boolean(window[storage].getItem(key)); } catch (_) { return false; }
  };
  const writeSessionFlag = () => {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (_) { /* In-memory guard still applies. */ }
  };
  if (readFlag("localStorage", STORAGE_KEY)) {
    const invite = document.getElementById("lead-invite");
    if (invite) invite.hidden = true;
    return;
  }

  const overlay = document.getElementById("coupon-overlay");
  const closeBtn = document.getElementById("coupon-close");
  const form = document.getElementById("coupon-form");
  const emailInp = document.getElementById("coupon-email");
  const whatsappInp = document.getElementById("coupon-whatsapp");
  const errorMsg = document.getElementById("coupon-error");
  const formState = document.getElementById("coupon-form-state");
  const succState = document.getElementById("coupon-success-state");
  const copyBtn = document.getElementById("coupon-copy-btn");
  const offer = document.querySelector(".offer-card");
  const examples = document.getElementById("resultados");
  const finalCta = document.getElementById("final-cta");
  const mediaDialog = document.getElementById("media-dialog");
  if (!overlay) return;

  let triggered = false;
  let checkoutIntent = false;
  let engagedSeconds = 0;
  let hasSeenOffer = false;
  let hasSeenExamples = false;
  let lastScroll = window.scrollY;
  let upwardDistance = 0;
  let returnFocus = null;
  let backgroundStates = [];

  const inView = (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };
  const updateExposure = () => {
    if (inView(offer)) hasSeenOffer = true;
    if (inView(examples)) hasSeenExamples = true;
  };
  const canInterrupt = () => !document.hidden && !checkoutIntent
    && !readFlag("sessionStorage", SESSION_KEY)
    && !inView(offer) && !inView(finalCta) && !inView(document.querySelector(".offer-summary"))
    && !document.querySelector("dialog[open]")
    && !document.querySelector(".site-nav.is-open")
    && document.activeElement?.tagName !== "VIDEO"
    && !Array.from(document.querySelectorAll("video")).some((video) => !video.paused && !video.ended)
    && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);

  const engagementTimer = window.setInterval(() => {
    if (!document.hidden && overlay.hidden) engagedSeconds += 1;
  }, 1000);

  function showPopup(manual = false, reason = "manual") {
    if (!manual && (triggered || !canInterrupt())) return;
    if (!overlay.hidden) return;
    triggered = true;
    window.clearInterval(engagementTimer);
    returnFocus = document.activeElement;
    backgroundStates = Array.from(document.querySelectorAll("main, .site-header, .site-footer, .contact-float, .sticky-cta")).map((node) => ({node, inert: node.inert}));
    backgroundStates.forEach(({node}) => { node.inert = true; });
    document.body.classList.add("coupon-is-open");
    overlay.hidden = false;
    // Do not open the mobile keyboard before the visitor chooses a field.
    const focusTarget = window.innerWidth < 800 || !succState.hidden ? closeBtn : emailInp;
    if (focusTarget) focusTarget.focus();
    document.dispatchEvent(new Event("cria:coupon-change"));
    if (window.fbq) window.fbq("trackCustom", "CRIA_CouponOpen", { trigger: reason });
  }

  function hidePopup() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    writeSessionFlag();
    document.body.classList.remove("coupon-is-open");
    backgroundStates.forEach(({node, inert}) => { node.inert = inert; });
    backgroundStates = [];
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll: true});
    document.dispatchEvent(new Event("cria:coupon-change"));
  }

  // No timer-only popup. On mobile, rescue a considered visit when the user returns up
  // through the content after seeing the price. Never interrupt the offer or a playing video.
  function onScroll() {
    updateExposure();
    const current = window.scrollY;
    if (current < lastScroll) upwardDistance += lastScroll - current;
    else if (current > lastScroll) upwardDistance = 0;
    lastScroll = current;
    if (engagedSeconds >= 60 && hasSeenOffer && upwardDistance >= 160) showPopup(false, "return_after_offer");
  }
  window.addEventListener("scroll", onScroll, {passive: true});
  window.addEventListener("resize", updateExposure, {passive: true});
  updateExposure();

  // Desktop exit intent requires prior engagement and product/price exposure.
  document.addEventListener("mouseout", (event) => {
    if (window.innerWidth < 900 || event.relatedTarget || event.clientY > 0) return;
    if (engagedSeconds >= 45 && (hasSeenExamples || hasSeenOffer)) showPopup(false, "desktop_exit");
  });
  document.querySelectorAll("[data-open-coupon]").forEach((button) => {
    button.addEventListener("click", () => showPopup(true, "manual"));
  });
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a.checkout-button") : null;
    if (link) {
      checkoutIntent = true;
      writeSessionFlag();
      window.clearInterval(engagementTimer);
    }
  }, {capture: true});
  closeBtn && closeBtn.addEventListener("click", hidePopup);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) hidePopup(); });
  document.addEventListener("keydown", (event) => {
    if (overlay.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); hidePopup(); }
    if (event.key === "Tab") {
      const focusable = Array.from(overlay.querySelectorAll("button, input, a[href]")).filter((el) => !el.disabled && !el.closest("[hidden]"));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  // Salvar lead no Supabase (email + whatsapp)
  async function saveLead(email, whatsapp) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ email, whatsapp, source: "popup_cupom" }),
      });
      return res.ok || res.status === 201;
    } catch {
      return false;
    }
  }

  // Envio do formulário
  form && form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = emailInp ? emailInp.value.trim() : "";
    const whatsapp = whatsappInp ? whatsappInp.value.replace(/\D/g, "") : "";

    // Validação email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorMsg.hidden = false;
      errorMsg.textContent = "Por favor, insira um e-mail válido.";
      emailInp && emailInp.focus();
      return;
    }
    // Validação WhatsApp — mínimo 10 dígitos (DDD + número)
    if (!/^[1-9]{2}\d{8,9}$/.test(whatsapp)) {
      errorMsg.hidden = false;
      errorMsg.textContent = "Por favor, insira seu WhatsApp com DDD.";
      whatsappInp && whatsappInp.focus();
      return;
    }
    errorMsg.hidden = true;

    // Feedback no botão
    const submitBtn = form.querySelector(".coupon-submit");
    const initialLabel = submitBtn.innerHTML;
    submitBtn.textContent = "Salvando…";
    submitBtn.disabled = true;

    const saved = await saveLead(email, "+55" + whatsapp);
    if (!saved) {
      errorMsg.textContent = "Não foi possível salvar agora. Tente novamente em instantes.";
      errorMsg.hidden = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = initialLabel;
      return;
    }
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (_) { /* Success remains available in this visit. */ }
    formState.hidden = true;
    succState.hidden = false;
  });

  // Botão copiar cupom
  copyBtn && copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText("CRIA25").then(() => {
      copyBtn.textContent = "Copiado ✓";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "Copiar";
        copyBtn.classList.remove("copied");
      }, 2500);
    }).catch(() => { copyBtn.textContent = "Use o código CRIA25"; });
  });

  // Fechar ao clicar em "Usar meu cupom agora"
  document.querySelector(".coupon-cta-btn") &&
    document.querySelector(".coupon-cta-btn").addEventListener("click", hidePopup);
})();


/* CTA intent measurement. No purchase events or backend changes. */
document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest("a[data-cta-position]") : null;
  if (link && window.fbq) {
    window.fbq("trackCustom", "CRIA_CheckoutClick", { position: link.dataset.ctaPosition });
  }
});
