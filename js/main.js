/**
 * WEBFLOW FRAMEWORK - MAIN JAVASCRIPT
 * Dynamically loads all framework JavaScript modules
 * GitHub Pages URL: https://harvey-au.github.io/webflow-framework/js/main.js
 */

(function () {
  "use strict";

  // Base URL for the framework
  const FRAMEWORK_BASE_URL = "https://harvey-au.github.io/webflow-framework/js/";

  // JavaScript modules to load
  const JS_MODULES = ["external-links.js", "tooltip.js", "social-share.js", "query-param-to-form.js"];

  /**
   * Dynamically load a JavaScript file
   * @param {string} src - The source URL of the script
   * @returns {Promise} Promise that resolves when script is loaded
   */
  function loadScript(src) {
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
        console.log(`✅ Webflow Framework: Loaded ${src.split("/").pop()}`);
        resolve();
      };

      script.onerror = () => {
        console.error(`❌ Webflow Framework: Failed to load ${src.split("/").pop()}`);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load all framework JavaScript modules
   */
  async function loadFramework() {
    console.log("🚀 Webflow Framework: Loading JavaScript modules...");

    try {
      // Load all modules in parallel
      const loadPromises = JS_MODULES.map((module) => {
        const fullUrl = FRAMEWORK_BASE_URL + module;
        return loadScript(fullUrl);
      });

      await Promise.all(loadPromises);

      console.log("✨ Webflow Framework: All JavaScript modules loaded successfully!");

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
