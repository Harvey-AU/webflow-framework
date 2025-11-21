(function () {
  "use strict";

  // Exit early if gtag isn't defined.
  if (typeof window.gtag !== "function") {
    console.error("GTag is not defined. Filter tracking will not run.");
    return;
  }

  // Private mapping of filter event names to their debounce configuration.
  const filterEvents = {};
  // Store the last processed query string.
  let lastQuery = null;
  // Timer for scheduling the "no results" check.
  let noResultsTimer = null;
  // Precomputed query string from the current URL parameters (formatted as key:value pairs).
  let preMadeQuery = "";
  // Name of event to be send to GA
  let eventName = "Search filter";

  // Build the filter events mapping from fields in the filters form.
  function buildFilterList() {
    const filterForm = document.querySelector('[fs-cmsfilter-element="filters"]');
    if (!filterForm) {
      console.error("Filter form not found.");
      return;
    }

    // Get the form element to send into GA as event name
    eventName = filterForm.getAttribute("fs-cmsfilter-formName") || eventName;

    const filterElements = filterForm.querySelectorAll("[fs-cmsfilter-field]");
    filterElements.forEach((el) => {
      const filterValue = el.getAttribute("fs-cmsfilter-field");
      if (filterValue && filterValue !== "default") {
        // Use the first value from a comma-separated list as the event name.
        const filterName = filterValue.split(",")[0].trim();

        // Determine the field-specific debounce delay (6× the provided value), if defined.
        let debounceDelay = 0;
        const debounceAttr = el.getAttribute("fs-cmsfilter-debounce");
        if (debounceAttr) {
          const numericDelay = parseInt(debounceAttr, 10);
          if (!isNaN(numericDelay)) {
            debounceDelay = numericDelay * 6;
          }
        }

        // Only add this event if it hasn't already been added.
        if (!filterEvents.hasOwnProperty(filterName)) {
          filterEvents[filterName] = {
            debounceDelay: debounceDelay,
            timer: null,
          };
        }
      }
    });
    console.log("✅ Filter events built:", filterEvents);
  }

  // Check for "no results" and send a GA event if needed.
  function checkAndSendNoResults() {
    const emptyEl = document.querySelector('[fs-cmsfilter-element="empty"]');
    if (!emptyEl) return;

    // Secondary verification after 500ms
    setTimeout(() => {
      const finalCheck = window.getComputedStyle(emptyEl);
      if (finalCheck.display !== "none") {
        console.log(`🔍 Confirmed 'No Results': ${preMadeQuery}`);
        window.gtag("event", "Filter No Results", {
          value: preMadeQuery,
          event_callback: () => {
            // Optional: Add visual feedback
            emptyEl.classList.add("ga-tracked-no-results");
          },
        });
      }
    }, 500);
  }

  // Send GA events based on URL parameters.
  function sendParamsToGA() {
    // Only process if the URL query has changed
    if (window.location.search === lastQuery) {
      return;
    }

    // Update the last processed query
    lastQuery = window.location.search;

    let urlParams;
    try {
      urlParams = new URLSearchParams(window.location.search);
    } catch (e) {
      console.error("Error parsing URL parameters:", e);
      return;
    }

    const usedFilters = new Set();
    let maxDebounce = 0;
    const queryParts = [];

    Object.keys(filterEvents).forEach((filterName) => {
      const value = urlParams.get(filterName);
      if (value) {
        usedFilters.add(filterName);
        queryParts.push(`${filterName}:${value}`);
        const { debounceDelay } = filterEvents[filterName];
        maxDebounce = Math.max(maxDebounce, debounceDelay);
        if (debounceDelay > 0) {
          // Clear any existing timer for this field before setting a new one.
          if (filterEvents[filterName].timer) {
            clearTimeout(filterEvents[filterName].timer);
          }
          filterEvents[filterName].timer = setTimeout(() => {
            console.log(`🔍 Sending event (debounced): ${filterName} = ${value}`);
            window.gtag("event", eventName, { filterName: value });
            filterEvents[filterName].timer = null;
          }, debounceDelay);
        } else {
          console.log(`🔍 Sending event: ${filterName} = ${value}`);
          window.gtag("event", eventName, { filterName: value });
        }
      }
    });

    // Precompute the query string from the current URL parameters.
    preMadeQuery = queryParts.join("&");

    // Send the combined filter event immediately.
    if (usedFilters.size > 0) {
      const filterCombination = Array.from(usedFilters).sort().join(",");
      console.log(`🔍 Filter combination used: ${filterCombination}`);
      window.gtag("event", "filter_used", { value: filterCombination });
    }

    if (noResultsTimer) {
      clearTimeout(noResultsTimer);
    }
    const delay = Math.max(maxDebounce, 100);
    noResultsTimer = setTimeout(checkAndSendNoResults, delay);
  }

  console.log("🚀 Building filter events list...");
  buildFilterList();
  console.log("🚀 Starting filter tracking...");
  sendParamsToGA();

  // Hook into history state changes and popstate to track URL changes.
  (function (history) {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (state, title, url) {
      const currentQuery = window.location.search;
      const newQuery = url
        ? typeof url === "string"
          ? new URL(url, location.href).search
          : location.search
        : location.search;

      if (currentQuery !== newQuery) {
        const result = originalPushState.apply(history, arguments);
        sendParamsToGA();
        return result;
      }
      return originalPushState.apply(history, arguments);
    };

    history.replaceState = function (state, title, url) {
      const result = originalReplaceState.apply(history, arguments);
      sendParamsToGA();
      return result;
    };
  })(window.history);

  window.addEventListener("popstate", function () {
    sendParamsToGA();
  });
})();
