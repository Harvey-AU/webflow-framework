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
  const importsCss = fs.readFileSync("src/css/imports.css", "utf8");

  // Generate concatenated main.css
  const concatenated = `/* WEBFLOW FRAMEWORK - GENERATED FILE */
/* Built from src/css/imports.css at ${new Date().toISOString()} */
/* Original imports replaced with file contents */

${resolveImports(importsCss, "src/css")}`;

  // Generate minified version with Lightning CSS
  console.log("🔧 Generating main.css (minified) with Lightning CSS...");

  try {
    const result = transform({
      code: Buffer.from(concatenated),
      minify: true,
    });

    const minifiedCSS = result.code.toString();
    const size = Math.round(minifiedCSS.length / 1024);

    const minifiedWithHeader = `/* WEBFLOW FRAMEWORK - MINIFIED */
/* Built from src/css/imports.css at ${new Date().toISOString()} with Lightning CSS */
/* Source: https://github.com/Harvey-AU/webflow-framework */
${minifiedCSS}`;

    // Save minified version as main.css
    fs.writeFileSync("dist/css/main.css", minifiedWithHeader);

    // Also save original concatenated version as main.unminified.css
    const originalWithHeader = `/* WEBFLOW FRAMEWORK - UNMINIFIED VERSION */
/* Built from src/css/imports.css at ${new Date().toISOString()} */
/* Source: https://github.com/Harvey-AU/webflow-framework */
${concatenated}`;

    fs.writeFileSync("dist/css/main.unminified.css", originalWithHeader);

    const originalSize = Math.round(concatenated.length / 1024);

    console.log(`✅ Built dist/css/main.css (${size}KB) - production version`);
    console.log(`✅ Built dist/css/main.unminified.css (${originalSize}KB) - unminified version`);
  } catch (error) {
    console.log(`❌ Lightning CSS failed: ${error.message}`);
  }

  // Create versioned snapshot
  console.log("📸 Creating versioned snapshot...");
  const baseDate = new Date().toISOString().slice(0,10); // 2025-10-02
  let counter = 1;

  // Find next available version number for this date
  while (fs.existsSync(`dist/v/${baseDate}/v${counter}`)) {
    counter++;
  }

  const versionDir = `dist/v/${baseDate}/v${counter}`;
  fs.mkdirSync(versionDir, { recursive: true });

  // Copy icons.html from src to dist with updated CSS path
  console.log("📄 Copying icons.html to dist...");
  let iconsHtml = fs.readFileSync("src/icons.html", "utf8");
  iconsHtml = iconsHtml.replace('href="css/imports.css"', 'href="css/main.css"');
  fs.writeFileSync("dist/icons.html", iconsHtml);
  console.log("✅ Built dist/icons.html");

  // Copy current build to versioned directory
  fs.cpSync("dist/css", `${versionDir}/css`, { recursive: true });
  fs.cpSync("dist/js", `${versionDir}/js`, { recursive: true });
  fs.copyFileSync("dist/icons.html", `${versionDir}/icons.html`);

  console.log(`📸 Snapshot created: v/${baseDate}/v${counter}`);
  console.log(`🔗 Stable URL: https://webflow.teamharvey.co/v/${baseDate}/v${counter}/css/main.css`);
  console.log(`🔗 Icons showcase: https://webflow.teamharvey.co/icons.html`);

  console.log("\n🚀 Ready for deployment!");
}

// Run the build
build();
