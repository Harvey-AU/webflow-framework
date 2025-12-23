(function() {
  "use strict";

  // Use WebflowFramework debug utility if available
  const debug = window.WebflowFramework?.debug || function(feature, topic, detail, type) {};

  function initSocialShare() {
  try {
    // Find all potential parent containers and check for marker
    const potentialContainers = document.querySelectorAll("[data-social-share-list]");

    // Check if any containers exist
    if (potentialContainers.length === 0) {
      debug("Social Share", "Initialisation", "No containers with [data-social-share-list] found", "info");
      return;
    }

    // Validate and sanitise share URL to prevent open redirect attacks
    function validateAndSanitiseShareUrl(url, expectedDomain) {
      try {
        const urlObj = new URL(url);

        // For mailto links, validate it's actually a mailto protocol
        if (!expectedDomain && urlObj.protocol === 'mailto:') {
          return url;
        }

        // For web URLs, validate protocol and domain
        if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
          return null;
        }

        if (!urlObj.hostname.endsWith(expectedDomain)) {
          return null;
        }

        // Return the validated URL
        return url;
      } catch (e) {
        return null;
      }
    }

    // Define a map for share URLs with expected domains for validation
    const shareUrlMap = {
      facebook: {
        buildUrl: (url) => `https://www.facebook.com/sharer.php?u=${url}`,
        domain: 'facebook.com'
      },
      linkedin: {
        buildUrl: (url) => `https://www.linkedin.com/sharing/share-offsite?url=${url}`,
        domain: 'linkedin.com'
      },
      x: {
        buildUrl: (title, url) => `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
        domain: 'twitter.com'
      },
      email: {
        buildUrl: (title, url) => `mailto:?subject=${title}&body=Check this out: ${url}`,
        domain: null // mailto doesn't have a domain to validate
      },
      whatsapp: {
        buildUrl: (title, url) => `https://api.whatsapp.com/send?text=${title}%0A${url}`,
        domain: 'whatsapp.com'
      },
    };

    potentialContainers.forEach((container) => {
    try {
      const marker = container.querySelector("#link-mode_sharing");
      if (!marker) return;

      const socialLinks = container.querySelectorAll("[data-social-share]");

      socialLinks.forEach((link) => {
      const platform = link.getAttribute("data-social-share")?.toLowerCase();

      // Skip Youtube and Instagram links
      if (platform === "youtube" || platform === "instagram") {
        return;
      }

      link.addEventListener("click", function (e) {
        e.preventDefault();

        const title = encodeURIComponent(document.title);
        const url = encodeURIComponent(window.location.href);
        let shareUrl = "";

        if (platform === "copy-link") {
          if (navigator.clipboard) {
            navigator.clipboard
              .writeText(window.location.href)
              .then(() => {
                const originalTitle = link.getAttribute("title") || "";
                link.setAttribute("title", "Copied!");

                setTimeout(() => {
                  if (originalTitle) {
                    link.setAttribute("title", originalTitle);
                  } else {
                    link.removeAttribute("title");
                  }
                }, 2000);
              })
              .catch((err) => {
                console.error("Failed to copy link:", err);
                link.setAttribute("title", "Copy failed");
              });
          } else {
            // Fallback for older browsers using execCommand
            try {
              const textArea = document.createElement("textarea");
              // Security: Setting .value on textarea is safe - it's text content, not HTML
              // Position offscreen to avoid flash of content
              textArea.style.position = 'fixed';
              textArea.style.top = '0';
              textArea.style.left = '0';
              textArea.style.width = '2em';
              textArea.style.height = '2em';
              textArea.style.padding = '0';
              textArea.style.border = 'none';
              textArea.style.outline = 'none';
              textArea.style.boxShadow = 'none';
              textArea.style.background = 'transparent';
              textArea.value = window.location.href;
              document.body.appendChild(textArea);
              textArea.select();
              try {
                document.execCommand("copy");
                link.setAttribute("title", "Copied!");
              } catch (err) {
                console.error("Fallback copy failed:", err);
                link.setAttribute("title", "Copy failed");
              }
              document.body.removeChild(textArea);
            } catch (err) {
              console.error("Fallback DOM operation failed:", err);
              link.setAttribute("title", "Copy failed");
            }
          }
          return;
        }

        // Get the share URL based on the platform
        if (shareUrlMap[platform]) {
          const platformConfig = shareUrlMap[platform];

          // Build the URL using the platform's buildUrl function
          if (platform === "facebook" || platform === "linkedin") {
            shareUrl = platformConfig.buildUrl(url);
          } else if (platform === "email") {
            shareUrl = platformConfig.buildUrl(title, url);
          } else {
            shareUrl = platformConfig.buildUrl(title, url);
          }

          // Security: Validate and sanitise URL to prevent open redirect
          const validatedUrl = validateAndSanitiseShareUrl(shareUrl, platformConfig.domain);
          if (!validatedUrl) {
            debug("Social Share", "Security", `Blocked invalid share URL for ${platform}`, "warn");
            console.warn(`Security: Blocked potentially malicious share URL`);
            return;
          }

          // Open validated URL only
          const popup = window.open(validatedUrl, "_blank", "noopener,noreferrer");
          if (!popup) {
            console.warn("Popup blocked - sharing may not work");
          }
        } else {
          console.warn(`Unknown platform: ${platform}`);
        }
      });
    });
    } catch (err) {
      console.error(`Social share: Error processing container:`, err);
    }
  });
  } catch (err) {
    console.error("Social share initialisation failed:", err);
  }
}

  // Initialise social share based on DOM ready state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSocialShare);
  } else {
    // DOM already loaded, initialise immediately
    initSocialShare();
  }
})();
