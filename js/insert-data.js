/* 

This is a prototype that was developed requiring adaptation to be adaptable to various projects / variables.
Leaving here as a potential solution for multiple clients.

# Purpose
Get calculated data from another page to dynamically insert into an element in this page.
Currently focused on 'counters' but those elements could be any content
Currently, on the /api page a series of collections render values, in this case it counts the number of records in a collection list based on pagination
See: RIAA project.

Means that we don't need to add a large collection element / list of many items for example to a page, improving performance.


# How it worked
1. It hits /api page (which should be modifiable per project or page)
2. On that page it seeks 'data-counter' elements but these could be anything really

*/

async function getAPIData(counterType) {
  // Check cache first
  try {
    const cache = JSON.parse(localStorage.getItem("riaaCounterCache") || "{}");
    const cacheAge = Date.now() - (cache.timestamp || 0);

    // Use cache if less than 5 minutes old
    if (cacheAge < 5 * 60 * 1000 && cache.data?.[counterType]) {
      document.querySelectorAll(`[data-insert="${counterType}"]`).forEach((el) => {
        el.textContent = cache.data[counterType];
      });
      console.log(`Using cached value for ${counterType}: ${cache.data[counterType]}`);
      return;
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }

  // Fetch fresh data if cache miss or expired
  const response = await fetch("/api");
  const html = await response.text();

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  setTimeout(() => {
    // Find the wrapper with this counter type
    const wrapper = iframe.contentDocument.querySelector(`[data-counter="${counterType}"]`);
    if (wrapper) {
      const value = wrapper.querySelector("[data-counter-display]")?.textContent;
      if (value) {
        document.querySelectorAll(`[data-insert="${counterType}"]`).forEach((el) => {
          el.textContent = value;
        });
      }
    }

    iframe.remove();
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  // Find all elements with data-insert and get unique counter types
  const insertElements = document.querySelectorAll("[data-insert]");
  const counterTypes = [...new Set(Array.from(insertElements).map((el) => el.getAttribute("data-insert")))];

  // Fetch data for each unique counter type found
  counterTypes.forEach((counterType) => {
    getAPIData(counterType);
  });
});
