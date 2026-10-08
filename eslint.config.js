const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: ["dist/css/**", "dist/v/**", "dist/js/*.*-v*.js", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["dist/js/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script", globals: { ...globals.browser } },
    rules: { "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }] },
  },
  {
    files: ["build.js", "eslint.config.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "commonjs", globals: { ...globals.node } },
  },
];
