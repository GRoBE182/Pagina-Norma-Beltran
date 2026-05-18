(function () {
  "use strict";

  /* ── Helpers ── */
  var $ = function(sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function(sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch(e) { console.warn("[" + name + "]", e); }
  }

  /* ── initSplash ── */
  function initSplash() {
    var splash = $("#splash");
    if (!splash) return;
    // CSS animation handles 3.8s fade; JS is the safety net
    var hideAt = Date.now() + 4500;
    function checkHide() {
      if (Date.now() >= hideAt) {
        splash.style.display = "none";
      } else {
        requestAnimationFrame(checkHide);
      }
    }
    requestAnimationFrame(checkHide);
    // Also listen for animationend
    splash.addEventListener("animationend", function() {
      splash.style.display = "none";
    });
  }

  /* ── initScrollBar ── */
  function initScrollBar() {
    var bar = $("#scroll-bar");
    if (!bar) return;
    window.addEventListener("scroll", function() {
      var scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = Math.min(100, scrolled) + "%";
    }, { passive: true });
  }

  /* ── initNav ── */
  function initNav() {
    var nav = $("#nav");
    var burger = $("#burger-btn");
    var mobileMenu = $("#mobile-menu");
    if (!nav) return;

    // Sticky scroll effect
    window.addEventListener("scroll", function() {
      if (window.scrollY > 60) {
        nav.classList.add("is-scrolled");
      } else {
        nav.classList.remove("is-scrolled");
      }
    }, { passive: true });

    // Burger toggle
    if (burger && mobileMenu) {
      burger.addEventListener("click", function() {
        var isOpen = nav.classList.toggle("menu-open");
        mobileMenu.classList.toggle("is-open", isOpen);
        burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
        mobileMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
      });

      // Close on mobile link click
      $$("a", mobileMenu).forEach(function(link) {
        link.addEventListener("click", function() {
          nav.classList.remove("menu-open");
          mobileMenu.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          mobileMenu.setAttribute("aria-hidden", "true");
        });
      });
    }

    // Smooth anchor scrolling
    document.addEventListener("click", function(e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    });
  }

  /* ── initHero ── */
  function initHero() {
    var hero = $("#hero");
    if (!hero) return;
    // Trigger subtle zoom-out on hero bg
    setTimeout(function() {
      hero.classList.add("is-loaded");
    }, 100);
  }

  /* ── initReveals ── */
  function initReveals() {
    var els = $$(".reveal");
    if (!els.length) return;

    // Safety net: reveal everything after 6s regardless
    var safeTimer = setTimeout(function() {
      els.forEach(function(el) { el.classList.add("is-visible"); });
    }, 6000);

    if (!window.IntersectionObserver) {
      clearTimeout(safeTimer);
      els.forEach(function(el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

    els.forEach(function(el) { io.observe(el); });

    // If all revealed, clear timer
    var observed = els.length;
    var revealed = 0;
    var checkDone = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { revealed++; }
        if (revealed >= observed) { clearTimeout(safeTimer); }
      });
    });
    els.forEach(function(el) { checkDone.observe(el); });
  }

  /* ── initCountUp ── */
  function initCountUp() {
    var counters = $$("[data-count]");
    if (!counters.length) return;

    function animateCount(el, target, duration) {
      var start = 0;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        // ease out
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute("data-count"), 10);
          animateCount(el, target, 1800);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(function(el) { io.observe(el); });
  }

  /* ── initCursor ── */
  function initCursor() {
    var root = $("[data-cursor-root]");
    if (!root || !fineHover) return;
    document.documentElement.classList.add("has-cursor");

    var dot = root.querySelector(".cursor-dot");
    var ring = root.querySelector(".cursor-ring");
    var tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", function(e) {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
      if (!firstMove) {
        firstMove = true;
        rx = tx; ry = ty;
        if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
        root.classList.add("is-ready");
      }
    }, { passive: true });

    (function tick() {
      rx += (tx - rx) * 0.15;
      ry += (ty - ry) * 0.15;
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(tick);
    })();

    var HOVER = "[data-cursor], .prop-card, .service-card, .btn-primary, .btn-ghost, .nav-cta, a[href]";
    document.addEventListener("mouseover", function(e) {
      if (e.target.closest(HOVER)) root.classList.add("is-interactive");
    });
    document.addEventListener("mouseout", function(e) {
      if (e.target.closest(HOVER)) {
        if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(HOVER))
          root.classList.remove("is-interactive");
      }
    });
  }

  /* ── initTestimonials ── */
  function initTestimonials() {
    var track = $("#testimonials-track");
    var dotsContainer = $("#testimonials-dots");
    if (!track || !dotsContainer) return;

    var slides = $$(".testimonial-slide", track);
    var dots = $$(".t-dot", dotsContainer);
    var current = 0;
    var total = slides.length;
    var autoInterval;

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = "translateX(-" + (current * 100) + "%)";
      dots.forEach(function(d, i) {
        d.classList.toggle("is-active", i === current);
        d.setAttribute("aria-selected", i === current ? "true" : "false");
      });
    }

    function startAuto() {
      autoInterval = setInterval(function() {
        goTo(current + 1);
      }, 5000);
    }

    function stopAuto() {
      clearInterval(autoInterval);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        stopAuto();
        goTo(parseInt(dot.getAttribute("data-index"), 10));
        startAuto();
      });
    });

    // Touch/swipe support
    var startX = 0;
    track.addEventListener("touchstart", function(e) {
      startX = e.touches[0].clientX;
      stopAuto();
    }, { passive: true });
    track.addEventListener("touchend", function(e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
      startAuto();
    }, { passive: true });

    // Pause on hover
    track.parentElement.addEventListener("mouseover", stopAuto);
    track.parentElement.addEventListener("mouseout", startAuto);

    goTo(0);
    startAuto();
  }

  /* ── initTilt ── */
  function initTilt() {
    if (!fineHover) return;
    var cards = $$(".prop-card");
    cards.forEach(function(card) {
      card.addEventListener("mousemove", function(e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "translateY(-6px) rotateX(" + (-y * 6) + "deg) rotateY(" + (x * 6) + "deg)";
        card.style.transition = "transform 0.1s linear, border-color 0.3s, box-shadow 0.4s";
      });
      card.addEventListener("mouseleave", function() {
        card.style.transform = "";
        card.style.transition = "transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.4s";
      });
    });
  }

  /* ── initForm ── */
  function initForm() {
    var form = $("#contact-form");
    var btn = $("#btn-submit");
    var success = $("#form-success");
    if (!form) return;

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Collect data for WhatsApp
      var nombre = (form.querySelector("#f-name") || {}).value || "";
      var telefono = (form.querySelector("#f-phone") || {}).value || "";
      var email = (form.querySelector("#f-email") || {}).value || "";
      var interes = (form.querySelector("#f-interest") || {}).value || "";
      var presupuesto = (form.querySelector("#f-budget") || {}).value || "";
      var mensaje = (form.querySelector("#f-msg") || {}).value || "";

      var waMsg = "Hola Norma, te escribe " + nombre + ".\n\n" +
        "📋 Interés: " + interes + "\n" +
        (presupuesto ? "💰 Presupuesto: " + presupuesto + "\n" : "") +
        (telefono ? "📞 Teléfono: " + telefono + "\n" : "") +
        "✉️ Email: " + email + "\n\n" +
        (mensaje ? "💬 Mensaje: " + mensaje : "");

      if (btn) {
        btn.disabled = true;
        btn.textContent = "Enviando...";
      }

      // Open WhatsApp after short delay for UX
      setTimeout(function() {
        var waUrl = "https://wa.me/59171677842?text=" + encodeURIComponent(waMsg);
        window.open(waUrl, "_blank", "noopener");

        // Show success state
        form.style.display = "none";
        if (success) {
          success.style.display = "flex";
          success.classList.add("is-visible");
        }
      }, 600);
    });
  }

  /* ── initGSAP ── */
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return;
    try { gsap.registerPlugin(ScrollTrigger); } catch(_) {}

    // Hero parallax on hero bg
    var heroBg = $(".hero-bg");
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // Stats card stagger with GSAP
    var statCards = $$(".stat-card");
    if (statCards.length) {
      gsap.fromTo(statCards,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#stats",
            start: "top 80%",
            once: true
          }
        }
      );
    }
  }

  /* ── Boot ── */
  function boot() {
    safe(initSplash, "initSplash");
    safe(initScrollBar, "initScrollBar");
    safe(initNav, "initNav");
    safe(initHero, "initHero");
    safe(initCursor, "initCursor");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    safe(initTestimonials, "initTestimonials");
    safe(initTilt, "initTilt");
    safe(initForm, "initForm");

    // GSAP-dependent: wait for libs to load
    if (window.gsap && window.ScrollTrigger) {
      safe(initGSAP, "initGSAP");
    } else {
      window.addEventListener("load", function() {
        if (window.gsap && window.ScrollTrigger) safe(initGSAP, "initGSAP");
      });
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
