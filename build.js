const fs = require("fs");
const path = require("path");
const { minify } = require("csso");

function resolveImports(cssContent, baseDir) {
  return cssContent.replace(/@import url\("\.\/([^"]+)"\);/g, (match, filepath) => {
    const fullPath = path.join(baseDir, filepath);
    if (fs.existsSync(fullPath)) {
      console.log(`📁 Including: ${filepath}`);
      const fileContent = fs.readFileSync(fullPath, "utf8");
      return `\n/* === ${filepath} === */\n${fileContent}`;
    } else {
      console.warn(`⚠️  File not found: ${fullPath}`);
      return match; // Keep original import if file not found
    }
  });
}

console.log("🏗️  Building CSS from imports...");

// Read the imports file
const importsCss = fs.readFileSync("css/imports.css", "utf8");

// Generate concatenated main.css
const concatenated = `/* WEBFLOW FRAMEWORK - GENERATED FILE */
/* Built from css/imports.css at ${new Date().toISOString()} */
/* Original imports replaced with file contents */

${resolveImports(importsCss, "css")}`;

// Generate minified version only
console.log("🔧 Generating main.min.css...");
const minified = minify(concatenated, {
  restructure: false, // Don't restructure CSS (prevents reordering)
  forceMediaMerge: false, // Don't merge media queries
  comments: true, // Remove comments
}).css;

// Add header comment to minified file
const minifiedWithHeader = `/* WEBFLOW FRAMEWORK - MINIFIED */
/* Built from css/imports.css at ${new Date().toISOString()} through build.js on Netlify */
/* Source: https://github.com/Harvey-AU/webflow-framework */
${minified}`;

fs.writeFileSync("css/main.min.css", minifiedWithHeader);

// Get file size
const minifiedSize = Math.round(minified.length / 1024);

console.log(`✅ Built css/main.min.css (${minifiedSize}KB)`);
console.log("🚀 Ready for deployment!");
