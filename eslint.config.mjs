import pluginJs from "@eslint/js";
import eslintconfigPrettier from "eslint-config-prettier"
import importPlugin from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [".next/*", ".turbo/*", "components/ui"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  importPlugin.flatConfigs.recommended,
  eslintconfigPrettier,
  {
    rules: {
      "no-constant-condition": "off",
      eqeqeq: "error",
      "react/react-in-jsx-scope": "off",
      "import/no-cycle": "error",
      "import/order": [
        "error",
        { alphabetize: { order: "asc" }, "newlines-between": "always" },
      ],
      "no-else-return": "error",
      "no-undef-init": "error",
      "no-unneeded-ternary": ["error",{defaultAssignment: false}],
      radix: "error",
      "sort-imports": ["error",{ignoreDeclarationSort: true}],
      "import/no-unresolved": "off"
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { args: "all", argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "@typescript-eslint/consistent-type-assertions": ["error",{assertionStyle: "never"}],
      "@typescript-eslint/consistent-type-imports": "error",
      "no-undef":"error",
    }
  },
  {
    files: ["**/*.tsx"],
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: hooksPlugin.configs.recommended.rules,
  },
];
