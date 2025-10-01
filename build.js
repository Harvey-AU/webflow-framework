const fs = require("fs");
const path = require("path");
const { transform } = require("lightningcss");

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

function build() {
  console.log("🏗️  Building CSS from imports...");

  // Read the imports file
  const importsCss = fs.readFileSync("css/imports.css", "utf8");

  // Generate concatenated main.css
  const concatenated = `/* WEBFLOW FRAMEWORK - GENERATED FILE */
/* Built from css/imports.css at ${new Date().toISOString()} */
/* Original imports replaced with file contents */

${resolveImports(importsCss, "css")}`;

  // Generate minified version with Lightning CSS
  console.log("🔧 Generating main.min.css with Lightning CSS...");

  try {
    const result = transform({
      code: Buffer.from(concatenated),
      minify: true,
    });

    const minifiedCSS = result.code.toString();
    const size = Math.round(minifiedCSS.length / 1024);

    const minifiedWithHeader = `/* WEBFLOW FRAMEWORK - MINIFIED */
/* Built from css/imports.css at ${new Date().toISOString()} with Lightning CSS */
/* Source: https://github.com/Harvey-AU/webflow-framework */
${minifiedCSS}`;

    fs.writeFileSync("css/main.min.css", minifiedWithHeader);

    console.log(`✅ Built css/main.min.css (${size}KB)`);
  } catch (error) {
    console.log(`❌ Lightning CSS failed: ${error.message}`);
  }

  console.log("\n🚀 Ready for testing!");
}

// Run the build
build();
