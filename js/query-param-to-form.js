(function() {
  "use strict";

  /*
   * Query Parameter Tracker
   *
   * Captures all URL query parameters (utm_source, gclid, etc.) across page visits
   * and stores them in a session cookie. Automatically adds these parameters as
   * hidden fields to all forms on the page for tracking attribution through form
   * submissions. Parameters accumulate across multiple page visits within the session.
   */

// Native cookie functions (no external library needed)
const Cookie = {
  get: (name) => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  },
  set: (name, value) => {
    document.cookie = `${name}=${value}; path=/; max-age=86400`; // 1 day expiration
  },
  remove: (name) => {
    document.cookie = `${name}=; path=/; max-age=0`;
  },
};

// Extract all URL query parameters as key-value object
function getAllUrlParams() {
  return Object.fromEntries(new URLSearchParams(location.search));
}

// Get stored parameters from cookie (with error handling)
function getParsedCookie() {
  try {
    return JSON.parse(Cookie.get("SessionParameters") || "{}");
  } catch (e) {
    return {};
  }
}

// Save parameters to cookie (merges with existing ones)
function createLead(urlParams) {
  const existingData = getParsedCookie();
  const mergedParams = { ...existingData.parameters, ...urlParams };
  const lead = { parameters: mergedParams };
  Cookie.set("SessionParameters", JSON.stringify(lead));
}

// Check if current URL params match what's already stored
function isCurrentParamsEqualToCookie(urlParams) {
  const cookieData = getParsedCookie();
  if (!cookieData.parameters) return false;

  const currentKeys = Object.keys(urlParams);
  const cookieKeys = Object.keys(cookieData.parameters);

  if (currentKeys.length !== cookieKeys.length) return false;

  for (const key of currentKeys) {
    if (cookieData.parameters[key] !== urlParams[key]) {
      return false;
    }
  }
  return true;
}

// Add hidden fields to all forms with stored parameter values
function createAndSetFormFields() {
  const cookieData = getParsedCookie();
  const emptyValue = "";
  const forms = document.querySelectorAll("form");

  if (forms.length === 0) return;

  // Remove existing hidden fields to avoid duplicates
  const existingFields = document.querySelectorAll("input[data-query-param]");
  existingFields.forEach((field) => field.remove());

  // Create hidden fields for each parameter in cookie and add to all forms
  forms.forEach((form) => {
    for (const [key, value] of Object.entries(cookieData.parameters || {})) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.className = key;
      input.value = value || emptyValue;
      input.setAttribute("data-query-param", "true");
      form.appendChild(input);
    }
  });
}

// STEP 1: Capture parameters immediately (works regardless of when script loads)
function captureUrlParameters() {
  const urlParams = getAllUrlParams();
  const cookieExist = Cookie.get("SessionParameters") !== undefined;
  const hasParams = Object.keys(urlParams).length > 0;

  if (hasParams && !cookieExist) {
    console.log("Created SessionParameters cookie");
    createLead(urlParams);
  } else if (hasParams && cookieExist) {
    console.log("Added to SessionParameters cookie");
    createLead(urlParams);
  }
  
  return { hasParams, cookieExist };
}

// STEP 2: Add form fields when DOM is ready
function handleFormFields() {
  const cookieExist = Cookie.get("SessionParameters") !== undefined;
  const forms = document.querySelectorAll("form");
  
  if (forms.length > 0 && cookieExist) {
    createAndSetFormFields();
  }
}

// Initialise: Capture parameters and handle forms based on DOM state
function init() {
  // Always capture parameters first
  captureUrlParameters();
  
  // Handle forms based on DOM ready state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleFormFields);
  } else {
    // DOM already loaded, handle forms immediately
    handleFormFields();
  }
}

  // Start initialisation
  init();
})();
