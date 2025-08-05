import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      ".next",
      ".react-router",
      "public/*.mjs"
    ]
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: globals.browser
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "react/react-in-jsx-scope": "off",
      "no-undef": "off" // let TypeScript handle undefined variables
    }
  }
);
