import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import preferArrow from "eslint-plugin-prefer-arrow";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/dist-test/**", "**/node_modules/**", "**/main.js", "**/*.mjs", "eslint.config.js"]
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      "@stylistic": stylistic,
      "prefer-arrow": preferArrow,
      react,
      "react-hooks": reactHooks,
      "unused-imports": unusedImports
    },
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/member-delimiter-style": "error",
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          "allowExpressions": true,
          "allowTypedFunctionExpressions": true
        }
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-arrow/prefer-arrow-functions": [
        "error",
        {
          "allowStandaloneDeclarations": true,
          "classPropertiesAllowed": false,
          "disallowPrototype": true,
          "singleReturnOnly": false
        }
      ],
      "react/function-component-definition": [
        "error",
        {
          "namedComponents": "arrow-function",
          "unnamedComponents": "arrow-function"
        }
      ],
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          "args": "after-used",
          "argsIgnorePattern": "^_",
          "vars": "all",
          "varsIgnorePattern": "^_"
        }
      ]
    },
    settings: {
      react: {
        version: "19.0"
      }
    }
  }
);
