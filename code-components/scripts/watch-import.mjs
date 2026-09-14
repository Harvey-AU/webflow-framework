// Watch src/ and re-import the Code Component library into Webflow on change.
// Usage: npm run import:watch
import { watch } from "node:fs";
import { spawn } from "node:child_process";

const DEBOUNCE_MS = 1500;
let timer, running = false, pending = false;

function runImport() {
  if (running) { pending = true; return; }
  running = true;
  console.log(`\n[watch-import] ${new Date().toLocaleTimeString()} importing...`);
  const child = spawn(
    "npx",
    ["webflow", "devlink", "import", "--no-input", "--skip-update-check", ...process.argv.slice(2)],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  child.on("exit", (code) => {
    running = false;
    console.log(`[watch-import] done (exit ${code}). Watching src/ ...`);
    if (pending) { pending = false; runImport(); }
  });
}

watch("src", { recursive: true }, (_event, file) => {
  if (!file || /(^|\/)\./.test(file)) return; // ignore dotfiles/editor temp files
  clearTimeout(timer);
  timer = setTimeout(runImport, DEBOUNCE_MS);
});

console.log("[watch-import] Watching src/ ... (pass extra flags through, e.g. --force)");
runImport();
