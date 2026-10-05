/* Ahsan Key Maker — interactions */
(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");

  /* Sticky header shrink */
  function onScroll() {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Active nav highlighting */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = ["home", "services", "about", "process", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* Fade-up reveals */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          // subtle stagger for sibling cards
          e.target.style.transitionDelay = Math.min((i % 4) * 70, 210) + "ms";
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { obs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ── Enquiry form: validation + secure-feeling handling ── */
  var form = document.getElementById("enquiryForm");
  if (form) {
    var status = document.getElementById("formStatus");
    var btn = document.getElementById("formBtn");

    function setErr(id, msg) {
      var small = form.querySelector('[data-err="' + id + '"]');
      var input = document.getElementById(id);
      if (small) small.textContent = msg || "";
      if (input) input.classList.toggle("invalid", !!msg);
    }

    function validIndianPhone(v) {
      var d = v.replace(/\D/g, "");
      if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
      if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
      return /^[6-9]\d{9}$/.test(d) ? d : null;
    }

    // Sanitize: strip HTML tags / trim / cap length
    function clean(s, max) {
      return String(s || "").replace(/<[^>]*>/g, "").replace(/[\x00-\x1F]/g, "").trim().slice(0, max);
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = clean(document.getElementById("fName").value, 80);
      var phoneRaw = document.getElementById("fPhone").value;
      var service = document.getElementById("fService").value;
      var message = clean(document.getElementById("fMsg").value, 800);

      var ok = true;
      if (name.length < 2) { setErr("fName", "Please enter your full name."); ok = false; }
      else setErr("fName", "");

      var digits = validIndianPhone(phoneRaw);
      if (!digits) { setErr("fPhone", "Enter a valid 10-digit mobile number."); ok = false; }
      else setErr("fPhone", "");

      if (!service) { setErr("fService", "Please choose a service."); ok = false; }
      else setErr("fService", "");

      if (!ok) {
        status.textContent = "Please correct the highlighted fields.";
        status.className = "form-status error";
        return;
      }

      // Loading state
      btn.disabled = true;
      btn.textContent = "Opening WhatsApp…";
      status.textContent = "Preparing your WhatsApp enquiry…";
      status.className = "form-status";

      // WhatsApp-only enquiry: pre-filled, service-specific message.
      var lines = [
        "Hello Ahsan Key Maker!",
        "I would like to enquire about: *" + service + "*",
        "Name: " + name,
        "Phone: " + digits
      ];
      if (message) lines.push("Details: " + message);
      var waUrl = "https://wa.me/916375342424?text=" + encodeURIComponent(lines.join("\n"));

      setTimeout(function () {
        // Direct open (user-gesture chain) + on-page fallback if blocked.
        window.open(waUrl, "_blank", "noopener");
        status.textContent = "Thank you, " + name.split(" ")[0] + ". WhatsApp should have opened with your " + service + " enquiry — tap below if it didn't.";
        status.className = "form-status success";
        btn.disabled = false;
        btn.textContent = "Request Assistance";

        var existing = document.getElementById("waSend");
        if (existing) {
          existing.href = waUrl;
        } else {
          var a = document.createElement("a");
          a.id = "waSend";
          a.href = waUrl;
          a.target = "_blank";
          a.rel = "noopener";
          a.className = "btn btn-wa btn-lg btn-block";
          a.style.marginBottom = "10px";
          a.textContent = "Continue on WhatsApp";
          btn.parentNode.insertBefore(a, btn);
          btn.style.display = "none";
        }
      }, 700);
    });

    // Live-clear errors
    ["fName", "fPhone", "fService"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", function () { setErr(id, ""); });
      if (el) el.addEventListener("change", function () { setErr(id, ""); });
    });
  }
})();
