(function() {
  "use strict";

  function initTooltips() {
  try {
    const tooltipTemplate = document.getElementById("tooltip-container");
    if (!tooltipTemplate) {
      console.error("Tooltip: Container element with id 'tooltip-container' not found");
      return;
    }

    tooltipTemplate.style.display = "none";
    const tooltips = new WeakMap();

  function positionTooltip(tooltipEl, targetEl) {
    const rect = targetEl.getBoundingClientRect();
    tooltipEl.style.top = window.scrollY + rect.top + "px";
    tooltipEl.style.left = window.scrollX + rect.right + 10 + "px";
  }

  function showTooltip(el, message) {
    try {
      let tooltip = tooltips.get(el);
      if (!tooltip) {
        tooltip = tooltipTemplate.cloneNode(true);
        tooltip.style.display = "none";
        tooltip.style.opacity = "0";

        // Generate unique ID for accessibility
        const tooltipId = "tooltip-" + Math.random().toString(36).substr(2, 9);
        tooltip.setAttribute("id", tooltipId);

        document.body.appendChild(tooltip);
        tooltips.set(el, tooltip);

        // Set aria-describedby on trigger
        el.setAttribute("aria-describedby", tooltipId);
      }

    clearTimeout(tooltip.showTimeout);
    clearTimeout(tooltip.hideTimeout);

    const tooltipTextEl = tooltip.querySelector(".tooltip-text");
    if (tooltipTextEl) {
      tooltipTextEl.textContent = message;
    } else {
      tooltip.textContent = message;
    }

    positionTooltip(tooltip, el);
    tooltip.style.display = "block";

    tooltip.showTimeout = setTimeout(() => {
      tooltip.style.opacity = "1";
    }, 100);
    } catch (err) {
      console.error("Tooltip: Error showing tooltip:", err);
    }
  }

  function hideTooltip(el) {
    const tooltip = tooltips.get(el);
    if (!tooltip) return;

    clearTimeout(tooltip.showTimeout);
    clearTimeout(tooltip.hideTimeout);

    tooltip.style.opacity = "0";
    tooltip.hideTimeout = setTimeout(() => {
      tooltip.style.display = "none";
    }, 100);

    // We intentionally leave aria-describedby intact for screen reader access
  }

  // Attach hover and focus events for hover-tooltips
  try {
    const hoverElements = document.querySelectorAll("[tooltip-hover]:not([tooltip-hover=''])");
    hoverElements.forEach((el) => {
    const message = el.getAttribute("tooltip-hover");

    el.addEventListener("mouseenter", function () {
      if (message) showTooltip(el, message);
    });

    el.addEventListener("mouseleave", function () {
      hideTooltip(el);
    });

    // ✅ Add keyboard accessibility
    el.addEventListener("focus", function () {
      if (message) showTooltip(el, message);
    });

    el.addEventListener("blur", function () {
      hideTooltip(el);
    });
  });
  } catch (err) {
    console.error("Tooltip: Error setting up hover tooltips:", err);
  }

  // Attach events for click-tooltips
  try {
    const clickElements = document.querySelectorAll("[tooltip-click]:not([tooltip-click=''])");
    clickElements.forEach((el) => {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      el.setAttribute("active-click", "");

      const message = el.getAttribute("tooltip-click");
      if (message) {
        showTooltip(el, message);
        setTimeout(() => {
          hideTooltip(el);
          el.removeAttribute("active-click");
        }, 2000);
      }
    });
  });
  } catch (err) {
    console.error("Tooltip: Error setting up click tooltips:", err);
  }
  } catch (err) {
    console.error("Tooltip initialisation failed:", err);
  }
}

  // Initialise tooltips based on DOM ready state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips);
  } else {
    // DOM already loaded, initialise immediately
    initTooltips();
  }
})();
