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

  const buildTimestamp = new Date();
  const buildTimestampIso = buildTimestamp.toISOString();
  const baseDate = buildTimestampIso.slice(0, 10);
  let versionCounter = 1;
  while (fs.existsSync(`dist/v/${baseDate}/v${versionCounter}`)) {
    versionCounter++;
  }
  const versionDir = `dist/v/${baseDate}/v${versionCounter}`;
  const versionTag = `${baseDate}-v${versionCounter}`;

  // Ensure dist directories exist (dist/js always exists from git-tracked files)
  fs.mkdirSync("dist/css", { recursive: true });
  fs.mkdirSync("dist/js", { recursive: true });

  // Read the imports file
  const importsCss = fs.readFileSync("src/css/imports.css", "utf8");

  // Generate concatenated main.css
  const concatenated = `/* WEBFLOW FRAMEWORK - GENERATED FILE */
/* Built from src/css/imports.css at ${buildTimestampIso} */
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
/* Built from src/css/imports.css at ${buildTimestampIso} with Lightning CSS */
/* Source: https://github.com/Harvey-AU/webflow-framework */
${minifiedCSS}`;

    // Save minified version as main.css
    fs.writeFileSync("dist/css/main.css", minifiedWithHeader);

    // Also write a version-tagged file for long-lived caching
    const hashedFilename = `main.${versionTag}.css`;
    fs.writeFileSync(`dist/css/${hashedFilename}`, minifiedWithHeader);

    // Also save original concatenated version as main.unminified.css
    const originalWithHeader = `/* WEBFLOW FRAMEWORK - UNMINIFIED VERSION */
/* Built from src/css/imports.css at ${buildTimestampIso} */
/* Source: https://github.com/Harvey-AU/webflow-framework */
${concatenated}`;

    fs.writeFileSync("dist/css/main.unminified.css", originalWithHeader);

    const originalSize = Math.round(concatenated.length / 1024);

    console.log(`✅ Built dist/css/main.css (${size}KB) - production version`);
    console.log(`✅ Built dist/css/${hashedFilename} (${size}KB) - version-tagged`);
    console.log(`✅ Built dist/css/main.unminified.css (${originalSize}KB) - unminified version`);

    // Prepare redirect and header entries
    const redirectLines = [
      `/css/main.css /css/${hashedFilename} 302!`,
    ];
    const headerBlocks = [
      `# Stable CSS should always revalidate
/css/main.css
  Cache-Control: public, max-age=0, must-revalidate

# Versioned CSS can be cached indefinitely
/css/${hashedFilename}
  Cache-Control: public, max-age=31536000, immutable
`,
    ];

    // Version-tag every JS file while keeping legacy filenames
    const jsFiles = fs
      .readdirSync("dist/js", { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
      .map((entry) => entry.name);

    jsFiles.forEach((filename) => {
      const sourcePath = `dist/js/${filename}`;
      const versionedName = filename.replace(/\.js$/, `.${versionTag}.js`);
      const versionedPath = `dist/js/${versionedName}`;

      fs.copyFileSync(sourcePath, versionedPath);

      redirectLines.push(`/js/${filename} /js/${versionedName} 302!`);
      headerBlocks.push(`# Stable JS should always revalidate
/js/${filename}
  Cache-Control: public, max-age=0, must-revalidate

# Versioned JS can be cached indefinitely
/js/${versionedName}
  Cache-Control: public, max-age=31536000, immutable
`);
    });

    fs.writeFileSync("dist/_redirects", redirectLines.join("\n") + "\n");
    console.log("✅ Created dist/_redirects");

    fs.writeFileSync("dist/_headers", headerBlocks.join("\n"));
    console.log("✅ Created dist/_headers");
  } catch (error) {
    console.log(`❌ Lightning CSS failed: ${error.message}`);
  }

  // Create versioned snapshot
  console.log("📸 Creating versioned snapshot...");
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

  console.log(`📸 Snapshot created: v/${baseDate}/v${versionCounter}`);
  console.log(`🔗 Stable URL: https://webflow.teamharvey.co/v/${baseDate}/v${versionCounter}/css/main.css`);
  console.log(`🔗 Icons showcase: https://webflow.teamharvey.co/icons.html`);

  console.log("\n🚀 Ready for deployment!");
}

// Run the build
build();
