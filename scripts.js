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

    const updateVideo = (video) => {
      const state = videoStates.get(video);
      if (!canBeVisible(video)) {
        pauseVideo(video);
        return;
      }

      if (state.manuallyPaused || prefersReducedMotion() || prefersLessData() || !video.paused) return;
      // A pause can precede its queued event. Do not restart until we know who paused it.
      if (state.expectedPauses > 0 || state.wasPlaying) return;

      // Controls remain available if the browser refuses automatic playback.
      try {
        state.wasPlaying = true;
        const playback = video.play();
        if (playback && typeof playback.then === "function") {
          playback.then(() => {
            // Loading may finish after a filter, scroll, modal, or preference change.
            if (!canBeVisible(video) || prefersReducedMotion() || prefersLessData()) pauseVideo(video);
          }).catch((error) => {
            // AbortError accompanies a queued pause; retain the guard until that event arrives.
            if (!error || error.name !== "AbortError") state.wasPlaying = !video.paused;
          });
        }
      } catch (_) {
        state.wasPlaying = !video.paused;
        // Older browsers can throw synchronously; the native play button still works.
      }
    };

    videos.forEach((video) => {
      videoStates.set(video, { visible: false, manuallyPaused: false, expectedPauses: 0, wasPlaying: !video.paused });
      video.addEventListener("play", () => {
        videoStates.get(video).wasPlaying = true;
      });
      video.addEventListener("pause", () => {
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
    const offer = document.getElementById("comprar");
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
        && !(dialog && dialog.open);
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
    let activeFilter = "all";
    let galleryExpanded = false;

    const updateGallery = () => {
      const matching = galleryItems.filter((item) => activeFilter === "all" || item.dataset.kind === activeFilter);
      const visible = new Set(galleryExpanded ? matching : matching.slice(0, initialItemCount));
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
        galleryMore.hidden = matching.length <= initialItemCount;
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

/* ── COUPON POPUP ── */
(function () {
  const STORAGE_KEY = "cria_lead_captured";
  const SUPABASE_URL = "https://ulapqyoltznvpbygvvik.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsYXBxeW9sdHpudnBieWd2dmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5OTE5NjIsImV4cCI6MjEwNDU2Nzk2Mn0.OC4IZqEWeivNDrWNrigUwhZ00_rPTXle7LvTqs2Ii1E";

  // Não mostrar se já capturou o e-mail
  if (localStorage.getItem(STORAGE_KEY)) return;

  const overlay   = document.getElementById("coupon-overlay");
  const closeBtn  = document.getElementById("coupon-close");
  const form      = document.getElementById("coupon-form");
  const emailInp  = document.getElementById("coupon-email");
  const errorMsg  = document.getElementById("coupon-error");
  const formState = document.getElementById("coupon-form-state");
  const succState = document.getElementById("coupon-success-state");
  const copyBtn   = document.getElementById("coupon-copy-btn");

  if (!overlay) return;

  let triggered = false;

  function showPopup() {
    if (triggered) return;
    triggered = true;
    overlay.hidden = false;
    // força reflow para a transição CSS funcionar
    overlay.offsetHeight;
    emailInp && emailInp.focus();

    // Countdown 10 minutos
    const countdownEl = document.getElementById("coupon-countdown");
    const timerEl     = document.getElementById("coupon-timer");
    if (!countdownEl) return;

    let seconds = 10 * 60; // 600 segundos

    function tick() {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      countdownEl.textContent = `${m}:${String(s).padStart(2, "0")}`;

      // Fica vermelho e pisca abaixo de 60s
      if (timerEl) timerEl.classList.toggle("urgent", seconds <= 60);

      if (seconds <= 0) {
        clearInterval(countdownInterval);
        // Popup fecha suavemente ao zerar
        hidePopup();
        return;
      }
      seconds--;
    }

    tick(); // exibe imediatamente sem esperar 1s
    const countdownInterval = setInterval(tick, 1000);
  }

  function hidePopup() {
    overlay.hidden = true;
  }

  // Trigger 1: após 8 segundos
  const timer = setTimeout(showPopup, 8000);

  // Trigger 2: ao rolar 50% da página
  function onScroll() {
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (scrolled >= 0.5) {
      clearTimeout(timer);
      showPopup();
      window.removeEventListener("scroll", onScroll);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // Fechar ao clicar no X
  closeBtn && closeBtn.addEventListener("click", hidePopup);

  // Fechar ao clicar fora do modal
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hidePopup();
  });

  // Fechar com Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) hidePopup();
  });

  // Salvar e-mail no Supabase
  async function saveEmail(email) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ email, source: "popup_cupom" }),
      });
      return res.ok || res.status === 201;
    } catch {
      return false; // erro de rede — mostra cupom mesmo assim
    }
  }

  // Envio do formulário
  form && form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInp.value.trim();

    // Validação básica
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorMsg.hidden = false;
      emailInp.focus();
      return;
    }
    errorMsg.hidden = true;

    // Feedback visual no botão
    const submitBtn = form.querySelector(".coupon-submit");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = "Salvando…";
    submitBtn.disabled = true;

    await saveEmail(email);

    // Marcar como capturado (não mostrar de novo)
    localStorage.setItem(STORAGE_KEY, "1");

    // Trocar para estado de sucesso
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

