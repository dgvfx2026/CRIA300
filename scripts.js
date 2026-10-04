(() => {
  "use strict";

  const initialize = () => {
    const motionPreference = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const prefersReducedMotion = () => Boolean(motionPreference && motionPreference.matches);
    const prefersLessData = () => Boolean(connection && connection.saveData);
    const dialog = document.getElementById("media-dialog");
    const videos = Array.from(document.querySelectorAll("video"));
    const videoStates = new WeakMap();

    const isDisplayed = (element) => !element.closest("[hidden]") && element.getClientRects().length > 0;
    const canBeVisible = (video) => videoStates.get(video).visible && isDisplayed(video)
      && !document.hidden && !(dialog && dialog.open);

    const pauseVideo = (video) => {
      const state = videoStates.get(video);
      if (!video.paused) {
        // Native pause events are queued: remember our own pauses separately from the viewer's.
        state.expectedPauses += 1;
        video.pause();
      }
    };

    const pauseAllVideos = () => videos.forEach(pauseVideo);

    // Playback starts only when the visitor chooses to play.
    const updateVideo = (video) => {
      if (!canBeVisible(video)) pauseVideo(video);
    };

    videos.forEach((video) => {
      videoStates.set(video, { visible: false, manuallyPaused: false, expectedPauses: 0, wasPlaying: !video.paused });
      const playButton = document.querySelector(`[data-video-play="${video.id}"]`);
      const media = video.parentElement;
      const synchronizePlayButton = () => {
        if (playButton) playButton.hidden = !video.paused && !video.ended;
        media.classList.toggle("is-playing", !video.paused && !video.ended);
      };
      if (playButton) {
        // Keep native controls as the fallback when JavaScript is unavailable.
        video.controls = false;
        playButton.hidden = false;
        playButton.addEventListener("click", () => {
          video.controls = true;
          const playback = video.play();
          if (playback && playback.catch) playback.catch(synchronizePlayButton);
        });
      }
      video.addEventListener("play", () => {
        videos.forEach((other) => { if (other !== video) pauseVideo(other); });
        videoStates.get(video).wasPlaying = true;
        synchronizePlayButton();
      });
      video.addEventListener("ended", synchronizePlayButton);
      video.addEventListener("pause", () => {
        synchronizePlayButton();
        const state = videoStates.get(video);
        const programmatic = state.expectedPauses > 0;
        if (programmatic) {
          state.expectedPauses -= 1;
        } else if (!video.ended) {
          // Preserve the viewer's choice even if the gallery changed before this event arrived.
          state.manuallyPaused = true;
        }
        state.wasPlaying = !video.paused;
        if (programmatic) updateVideo(video);
      });
    });

    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          videoStates.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
          updateVideo(entry.target);
        });
      }, { threshold: [0, 0.55] });
      videos.forEach((video) => videoObserver.observe(video));
    }
    // Without IntersectionObserver videos use their ordinary, on-demand controls.

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseAllVideos();
      else videos.forEach(updateVideo);
    });

    const menuToggle = document.getElementById("menu-toggle");
    const navigation = document.getElementById("site-nav");
    const hero = document.getElementById("hero");
    const offer = document.querySelector(".offer-card");
    const finalCta = document.getElementById("final-cta");
    const stickyCta = document.getElementById("sticky-cta");
    let framePending = false;

    const closeMenu = (restoreFocus = false) => {
      if (!menuToggle || !navigation) return;
      const wasOpen = navigation.classList.contains("is-open");
      navigation.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      if (restoreFocus && wasOpen) menuToggle.focus();
      scheduleLayoutUpdate();
    };

    const intersectsViewport = (element, viewportHeight) => {
      if (!element) return false;
      const bounds = element.getBoundingClientRect();
      return bounds.top < viewportHeight && bounds.bottom > 0;
    };

    const updateLayout = () => {
      framePending = false;
      if (window.innerWidth > 800 && navigation && navigation.classList.contains("is-open")) closeMenu();
      if (!stickyCta || !hero) return;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const shouldShow = hero.getBoundingClientRect().bottom <= 0
        && !intersectsViewport(offer, viewportHeight)
        && !intersectsViewport(finalCta, viewportHeight)
        && !(navigation && navigation.classList.contains("is-open"))
        && !(dialog && dialog.open)
        && !document.body.classList.contains("coupon-is-open");
      stickyCta.hidden = !shouldShow;
    };

    function scheduleLayoutUpdate() {
      if (framePending) return;
      framePending = true;
      if (window.requestAnimationFrame) window.requestAnimationFrame(updateLayout);
      else window.setTimeout(updateLayout, 16);
    }

    if (menuToggle && navigation) {
      menuToggle.hidden = false;
      menuToggle.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
        scheduleLayoutUpdate();
      });
      navigation.addEventListener("click", (event) => {
        if (event.target instanceof Element && event.target.closest("a")) closeMenu();
      });
      document.addEventListener("click", (event) => {
        if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navigation.classList.contains("is-open")) closeMenu(true);
      });
    }

    document.addEventListener("cria:coupon-change", scheduleLayoutUpdate);
    window.addEventListener("scroll", scheduleLayoutUpdate, { passive: true });
    window.addEventListener("resize", scheduleLayoutUpdate, { passive: true });
    window.addEventListener("load", scheduleLayoutUpdate, { once: true });
    if ("ResizeObserver" in window) {
      const layoutObserver = new ResizeObserver(scheduleLayoutUpdate);
      layoutObserver.observe(document.body);
    }

    const filters = Array.from(document.querySelectorAll(".filter-button[data-filter]"));
    const galleryItems = Array.from(document.querySelectorAll(".gallery-item[data-kind]"));
    const galleryStatus = document.getElementById("gallery-status");
    const galleryMore = document.getElementById("gallery-more");
    const galleryToolbar = document.querySelector(".gallery-toolbar");
    const initialItemCount = 6;
    const galleryMobile = window.matchMedia ? window.matchMedia("(max-width: 800px)") : null;
    let activeFilter = "all";
    let galleryExpanded = false;

    const updateGallery = () => {
      // One full-width FOOH followed by three complete pairs on mobile.
      const itemLimit = activeFilter !== "image" && (galleryMobile ? galleryMobile.matches : window.innerWidth <= 800)
        ? initialItemCount + 1 : initialItemCount;
      const matching = galleryItems.filter((item) => activeFilter === "all" || item.dataset.kind === activeFilter);
      const visible = new Set(galleryExpanded ? matching : matching.slice(0, itemLimit));
      galleryItems.forEach((item) => {
        item.hidden = !visible.has(item);
        if (item.hidden) {
          if (item.matches("video")) pauseVideo(item);
          item.querySelectorAll("video").forEach(pauseVideo);
        }
      });
      filters.forEach((button) => {
        const selected = button.dataset.filter === activeFilter;
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("is-active", selected);
      });
      if (galleryMore) {
        galleryMore.hidden = matching.length <= itemLimit;
        galleryMore.textContent = galleryExpanded ? "Mostrar menos" : "Ver mais exemplos";
        galleryMore.setAttribute("aria-expanded", String(galleryExpanded));
      }
      if (galleryStatus) {
        const type = activeFilter === "image" ? "imagens" : activeFilter === "video" ? "vídeos" : "exemplos";
        galleryStatus.textContent = matching.length
          ? `${visible.size} de ${matching.length} ${type}`
          : "Nenhum exemplo nesta categoria.";
      }
      scheduleLayoutUpdate();
    };

    if (galleryItems.length) {
      const filterGroup = document.querySelector(".gallery-filters");
      if (filterGroup) filterGroup.hidden = false;
      filters.forEach((button) => {
        button.addEventListener("click", () => {
          activeFilter = button.dataset.filter;
          galleryExpanded = false;
          updateGallery();
        });
      });
      if (galleryMore) {
        galleryMore.addEventListener("click", () => {
          if (galleryExpanded && galleryToolbar) {
            const selectedFilter = filters.find((button) => button.dataset.filter === activeFilter);
            if (selectedFilter) {
              try { selectedFilter.focus({ preventScroll: true }); } catch (_) { selectedFilter.focus(); }
            }
            // Move to a stable anchor before removing rows above the focused button.
            if (galleryToolbar.scrollIntoView) {
              try {
                galleryToolbar.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
              } catch (_) {
                galleryToolbar.scrollIntoView();
              }
            }
          }
          galleryExpanded = !galleryExpanded;
          updateGallery();
        });
      }
      updateGallery();
      if (galleryMobile) {
        if (galleryMobile.addEventListener) galleryMobile.addEventListener("change", updateGallery);
        else if (galleryMobile.addListener) galleryMobile.addListener(updateGallery);
      }
    }

    const dialogImage = document.getElementById("dialog-image");
    const dialogCaption = document.getElementById("dialog-caption");
    let returnFocus = null;
    if (dialog && dialogImage && typeof dialog.showModal === "function") {
      document.querySelectorAll("a[data-lightbox]").forEach((link) => {
        link.addEventListener("click", (event) => {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          const thumbnail = link.querySelector("img");
          dialogImage.src = link.href;
          dialogImage.alt = thumbnail ? thumbnail.alt : (link.dataset.caption || "Exemplo criado com o CRIA");
          if (dialogCaption) dialogCaption.textContent = link.dataset.caption || dialogImage.alt;
          try {
            dialog.showModal();
          } catch (_) {
            return; // Keep the original image link usable if a browser cannot open the dialog.
          }
          event.preventDefault();
          returnFocus = link;
          pauseAllVideos();
          scheduleLayoutUpdate();
        });
      });
      const closeButton = dialog.querySelector(".dialog-close");
      if (closeButton) closeButton.addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
          dialog.close();
        }
      });
      dialog.addEventListener("close", () => {
        if (returnFocus && returnFocus.isConnected) {
          try { returnFocus.focus({ preventScroll: true }); } catch (_) { returnFocus.focus(); }
        }
        returnFocus = null;
        dialogImage.removeAttribute("src");
        videos.forEach(updateVideo);
        scheduleLayoutUpdate();
      });
    }

    const revealElements = Array.from(document.querySelectorAll(".reveal"));
    let revealObserver = null;
    const revealAll = () => {
      revealElements.forEach((element) => {
        element.classList.remove("will-reveal");
        element.classList.add("is-visible");
      });
      if (revealObserver) revealObserver.disconnect();
    };

    if ("IntersectionObserver" in window && !prefersReducedMotion()) {
      try {
        revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        }, { threshold: 0.06, rootMargin: "0px 0px -24px 0px" });
        revealElements.forEach((element) => {
          element.classList.add("will-reveal");
          revealObserver.observe(element);
        });
      } catch (_) {
        revealAll();
      }
    }

    const updatePreferences = () => {
      if (prefersReducedMotion()) revealAll();
      if (prefersReducedMotion() || prefersLessData()) pauseAllVideos();
      else videos.forEach(updateVideo);
    };
    if (motionPreference) {
      if (motionPreference.addEventListener) motionPreference.addEventListener("change", updatePreferences);
      else if (motionPreference.addListener) motionPreference.addListener(updatePreferences);
    }
    if (connection && connection.addEventListener) connection.addEventListener("change", updatePreferences);
    scheduleLayoutUpdate();

    // Keep the existing PageView measurement restricted to the published CRIA domains.
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
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
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
    && !inView(offer) && !inView(finalCta)
    && !(mediaDialog && mediaDialog.open)
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
    if (!whatsapp || whatsapp.length < 10) {
      errorMsg.hidden = false;
      errorMsg.textContent = "Por favor, insira seu WhatsApp com DDD.";
      whatsappInp && whatsappInp.focus();
      return;
    }
    errorMsg.hidden = true;

    // Feedback no botão
    const submitBtn = form.querySelector(".coupon-submit");
    submitBtn.innerHTML = "Salvando…";
    submitBtn.disabled = true;

    await saveLead(email, "+55" + whatsapp);

    localStorage.setItem(STORAGE_KEY, "1");
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
    });
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
