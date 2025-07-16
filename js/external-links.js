function initExternalLinks() {
  const links = document.querySelectorAll("a");

  // Get current hostname
  const currentHostname = window.location.hostname;

  // Extract the base/root domain (e.g., "example.com" from "www.blog.example.com")
  function extractBaseDomain(hostname) {
    // Remove www. if present
    let domain = hostname.replace(/^www\./i, "");

    // Split the domain by dots and get the last two parts (e.g., "example.com")
    // This is a simple approach that works for most common domains
    const parts = domain.split(".");
    if (parts.length > 2) {
      // Take the last two parts for domains like blog.example.com
      return parts.slice(-2).join(".");
    }
    return domain;
  }

  // Get the base domain for the current page
  const currentBaseDomain = extractBaseDomain(currentHostname);

  links.forEach((link) => {
    // Skip links without href, javascript:, mailto:, or anchor links
    if (!link.href || link.href.startsWith("javascript:") || link.href.startsWith("mailto:") || link.href === "#" || link.href.startsWith("#")) {
      return;
    }

    try {
      const linkUrl = new URL(link.href);

      // Skip non-HTTP protocols
      if (linkUrl.protocol !== "http:" && linkUrl.protocol !== "https:") {
        return;
      }

      // Extract the base domain for the link
      const linkBaseDomain = extractBaseDomain(linkUrl.hostname);

      // Compare base domains instead of full hostnames
      if (linkBaseDomain !== currentBaseDomain) {
        // External link - open in new tab
        link.setAttribute("target", "_blank");
        // Add security attributes
        link.setAttribute("rel", "noopener noreferrer");
      }
    } catch (e) {
      // Handle invalid URLs gracefully
      console.debug("Error processing link:", link.href);
    }
  });
}

// Initialize external links based on DOM ready state
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExternalLinks);
} else {
  // DOM already loaded, initialize immediately
  initExternalLinks();
}
