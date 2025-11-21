/**
 * WEBFLOW FRAMEWORK - MAIN JAVASCRIPT
 * Dynamically loads all framework JavaScript modules
 * URL: https://webflow.teamharvey.co/js/main.js
 */

(function () {
  "use strict";

  // Base URL for the framework
  const FRAMEWORK_BASE_URL = "https://webflow.teamharvey.co/js/";

  // JavaScript modules to load
  const JS_MODULES = ["external-links.js", "tooltip.js", "social-share.js", "query-param-to-form.js", "filter-tracking.js"];

  /**
   * Dynamically load a JavaScript file with retry logic
   * @param {string} src - The source URL of the script
   * @param {number} retryCount - Current retry attempt (default: 0)
   * @returns {Promise} Promise that resolves when script is loaded
   */
  function loadScript(src, retryCount = 0) {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;

      script.onload = () => {
        console.debug(`✅ Webflow Framework: Loaded ${src.split("/").pop()}`);
        resolve();
      };

      script.onerror = () => {
        if (retryCount < 1) {
          console.debug(`⚠️ Webflow Framework: Retrying ${src.split("/").pop()}`);
          // Remove failed script element
          script.remove();
          // Retry after 300ms
          setTimeout(() => {
            loadScript(src, retryCount + 1).then(resolve).catch(reject);
          }, 300);
        } else {
          console.error(`❌ Webflow Framework: Failed to load ${src.split("/").pop()} after retry`);
          reject(new Error(`Failed to load script: ${src}`));
        }
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load all framework JavaScript modules
   */
  async function loadFramework() {
    console.debug("🚀 Webflow Framework: Loading JavaScript modules...");

    try {
      // Load all modules in parallel
      const loadPromises = JS_MODULES.map((module) => {
        const fullUrl = FRAMEWORK_BASE_URL + module;
        return loadScript(fullUrl);
      });

      await Promise.all(loadPromises);

      console.log(`✨ Webflow Framework: ${JS_MODULES.length} modules loaded successfully`);

      // Dispatch custom event when framework is ready
      const event = new CustomEvent("webflowFrameworkReady", {
        detail: {
          modules: JS_MODULES,
          timestamp: new Date().toISOString(),
        },
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.error("💥 Webflow Framework: Error loading modules:", error);
    }
  }

  /**
   * Initialise the framework when DOM is ready
   */
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", loadFramework);
    } else {
      // DOM is already ready
      loadFramework();
    }
  }

  // Start loading the framework
  init();

  // Expose framework info to global scope for debugging
  window.WebflowFramework = {
    modules: JS_MODULES,
    baseUrl: FRAMEWORK_BASE_URL,
    reload: loadFramework,
  };
})();
