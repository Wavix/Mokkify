import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier"
import unusedImports from "eslint-plugin-unused-imports"

export default defineConfig([
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts"]),
  nextVitals,
  nextTs,
  {
    plugins: {
      "unused-imports": unusedImports
    },
    settings: {
      react: {
        version: "19.2"
      }
    },
    rules: {
      "func-style": ["error", "expression"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-irregular-whitespace": "warn",
      "no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true
        }
      ],
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "import/export": "error",
      "import/no-duplicates": "error",
      "import/newline-after-import": ["error", { count: 1 }],
      "import/order": [
        "error",
        {
          "pathGroups": [
            {
              pattern: "@chakra-ui/**",
              group: "external",
              position: "after"
            },
            {
              pattern: "@components/**",
              group: "parent"
            },
            {
              pattern: "@config/**",
              group: "parent",
              position: "after"
            },
            {
              pattern: "@/**",
              group: "parent",
              position: "after"
            }
          ],
          "pathGroupsExcludedImportTypes": ["builtin", "type"],
          "groups": ["builtin", "external", "internal", "parent", "sibling", "object", "type", "index"],
          "newlines-between": "always",
          "alphabetize": { order: "asc" }
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: false
        }
      ],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/array-type": ["error", { default: "generic" }],
      "@typescript-eslint/no-shadow": ["warn", { ignoreFunctionTypeParameterNameValueShadow: true }],
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../../**/*"],
              message: "Please use alias paths instead"
            },
            {
              group: ["state/*", "lib/*", "styles/*", "app/*", "config/*"],
              message: "Please add `@` to path"
            }
          ]
        }
      ],
      "react/prop-types": "off",
      "react/jsx-filename-extension": [
        "error",
        {
          extensions: [".tsx", ".ts", ".jsx"]
        }
      ],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function"
        }
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off"
    }
  },
  {
    // Generated shadcn/ui primitives keep upstream style so future `shadcn add` diffs stay clean
    files: ["src/components/ui/**", "src/hooks/use-mobile.ts"],
    rules: {
      "func-style": "off",
      "react/function-component-definition": "off",
      "react-hooks/purity": "off",
      "import/order": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/array-type": "off"
    }
  },
  prettier
])
