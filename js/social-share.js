document.addEventListener("DOMContentLoaded", function () {
  // Approach 1: Find all potential parent containers and check for marker
  const potentialContainers = document.querySelectorAll("[data-social-share-list]");

  // Define a map for share URLs
  const shareUrlMap = {
    facebook: (url) => `https://www.facebook.com/sharer.php?u=${url}`,
    linkedin: (url) => `https://www.linkedin.com/sharing/share-offsite?url=${url}`,
    x: (title, url) => `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
    email: (title, url) => `mailto:?subject=${title}&body=Check this out: ${url}`,
    whatsapp: (title, url) => `https://api.whatsapp.com/send?text=${title}%0A${url}`,
  };

  potentialContainers.forEach((container) => {
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
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
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
          }
          return;
        }

        // Get the share URL based on the platform
        if (shareUrlMap[platform]) {
          if (platform === "facebook" || platform === "linkedin") {
            shareUrl = shareUrlMap[platform](url);
          } else {
            shareUrl = shareUrlMap[platform](title, url);
          }
          const popup = window.open(shareUrl, "_blank", "noopener,noreferrer");
          if (!popup) {
            console.warn("Popup blocked - sharing may not work");
          }
        } else {
          console.warn(`Unknown platform: ${platform}`);
        }
      });
    });
  });
});
