import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [".next/*",".turbo/*","components/ui"]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "warn"
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "no-constant-condition": "off",
      "@typescript-eslint/no-unused-vars":[
        "error",
        {args: "all", argsIgnorePattern: "^_", ignoreRestSiblings: true}
      ],
      "eqeqeq": "error",
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: {
      "react-hooks": hooksPlugin
    },
    rules: hooksPlugin.configs.recommended.rules,
  },
];