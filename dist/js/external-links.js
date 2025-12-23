(function() {
  "use strict";

  // Use WebflowFramework debug utility if available
  const debug = window.WebflowFramework?.debug || function(feature, topic, detail, type) {};

  function initExternalLinks() {
  const links = document.querySelectorAll("a");

  // Get current hostname
  const currentHostname = window.location.hostname;

  // Extract the base/root domain (e.g., "example.com" from "www.blog.example.com")
  function extractBaseDomain(hostname) {
    // Remove www. if present
    let domain = hostname.replace(/^www\./i, "");

    // Comprehensive list of multi-level TLDs
    const multiLevelTLDs = [
      // United Kingdom
      'co.uk', 'ac.uk', 'gov.uk', 'org.uk', 'net.uk', 'sch.uk', 'nhs.uk', 'police.uk', 'mod.uk', 'me.uk',
      // Australia
      'com.au', 'edu.au', 'gov.au', 'org.au', 'net.au', 'asn.au', 'id.au',
      // New Zealand
      'co.nz', 'ac.nz', 'govt.nz', 'org.nz', 'net.nz', 'school.nz',
      // South Africa
      'co.za', 'ac.za', 'gov.za', 'org.za', 'net.za',
      // Brazil
      'com.br', 'edu.br', 'gov.br', 'org.br', 'net.br', 'vet.br', 'wiki.br',
      // Japan
      'co.jp', 'ac.jp', 'go.jp', 'or.jp', 'ne.jp',
      // India
      'co.in', 'ac.in', 'gov.in', 'org.in', 'net.in',
      // China
      'com.cn', 'edu.cn', 'gov.cn', 'net.cn', 'org.cn',
      // Hong Kong
      'com.hk', 'edu.hk', 'gov.hk', 'org.hk', 'net.hk',
      // Singapore
      'com.sg', 'edu.sg', 'gov.sg', 'org.sg', 'net.sg',
      // Malaysia
      'com.my', 'edu.my', 'gov.my', 'org.my', 'net.my',
      // Thailand
      'co.th', 'ac.th', 'go.th', 'or.th', 'net.th',
      // Mexico
      'com.mx', 'edu.mx', 'gob.mx', 'org.mx', 'net.mx',
      // Argentina
      'com.ar', 'edu.ar', 'gov.ar', 'org.ar', 'net.ar',
      // Colombia
      'com.co', 'edu.co', 'gov.co', 'org.co', 'net.co',
      // Israel
      'co.il', 'ac.il', 'gov.il', 'org.il', 'net.il',
      // Turkey
      'com.tr', 'edu.tr', 'gov.tr', 'org.tr', 'net.tr'
    ];

    const parts = domain.split(".");
    
    // Check for multi-level TLDs
    for (let i = 2; i <= 3 && i <= parts.length; i++) {
      const tld = parts.slice(-i).join(".");
      if (multiLevelTLDs.includes(tld)) {
        return parts.slice(-(i + 1)).join(".");
      }
    }
    
    // Default: take last two parts for standard TLDs
    if (parts.length > 2) {
      return parts.slice(-2).join(".");
    }
    return domain;
  }

  // Get the base domain for the current page
  const currentBaseDomain = extractBaseDomain(currentHostname);

  links.forEach((link) => {
    // Skip links without href, javascript:, mailto:, or anchor links
    if (!link.href || link.href === "#" || link.href.startsWith("#")) {
      return;
    }

    try {
      const linkUrl = new URL(link.href);

      // Security: Block dangerous protocols that could execute code or leak data
      const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:", "about:"];
      if (dangerousProtocols.includes(linkUrl.protocol)) {
        debug("External Links", "Security", `Blocked dangerous protocol: ${linkUrl.protocol}`, "warn");
        return;
      }

      // Skip non-HTTP protocols (mailto, tel, etc. are allowed)
      if (linkUrl.protocol !== "http:" && linkUrl.protocol !== "https:") {
        return;
      }

      // Extract the base domain for the link
      const linkBaseDomain = extractBaseDomain(linkUrl.hostname);

      // Check if the link is external by comparing base domains
      // If base domains match, it's internal (handles all subdomains)
      const isExternal = linkBaseDomain !== currentBaseDomain;

      if (isExternal) {
        // External link - open in new tab
        link.setAttribute("target", "_blank");
        // Add security attributes
        link.setAttribute("rel", "noopener noreferrer");
      }
    } catch (e) {
      // Handle invalid URLs gracefully
      debug("External Links", "URL Processing", `Error processing link: ${link.href}`, "warn");
    }
  });
}

  // Initialise external links based on DOM ready state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExternalLinks);
  } else {
    // DOM already loaded, initialise immediately
    initExternalLinks();
  }
})();
