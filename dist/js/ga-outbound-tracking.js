/**
 * WEBFLOW FRAMEWORK - GA OUTBOUND TRACKING
 * Sends a GA4 event with link text for clicks on external links
 */

(function () {
  "use strict";

  const debug = window.WebflowFramework?.debug || function () {};

  document.addEventListener("click", function (e) {
    const link = e.target.closest("a[href]");
    if (!link) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    // Only http(s) links to other domains
    if (
      !/^https?:$/.test(url.protocol) ||
      url.hostname === window.location.hostname
    )
      return;

    const linkText = (link.innerText || link.getAttribute("aria-label") || "")
      .trim()
      .slice(0, 100);

    if (typeof window.gtag !== "function") {
      debug(
        "Outbound Tracking",
        "Click",
        "gtag not available, event not sent",
        "warn",
      );
      return;
    }

    // Strip credentials (userinfo) and fragment before sending. Fragments can
    // carry auth tokens (e.g. OAuth implicit flow) and add no analytics value.
    // Query string is kept to match GA4 Enhanced Measurement's link_url; use
    // GA's data redaction for query-param PII if required.
    const linkUrl = url.origin + url.pathname + url.search;

    try {
      window.gtag("event", "outbound_click", {
        link_url: linkUrl,
        link_domain: url.hostname,
        link_text: linkText,
        page_path: window.location.pathname,
      });
    } catch {
      debug("Outbound Tracking", "Click", "gtag threw, event not sent", "warn");
      return;
    }

    debug("Outbound Tracking", "Click", `${url.hostname} — "${linkText}"`);
  });

  debug("Outbound Tracking", "Initialisation", "Listener attached");
})();
