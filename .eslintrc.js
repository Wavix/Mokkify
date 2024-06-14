module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    "browser": true,
    "jest/globals": true
  },
  plugins: ["@typescript-eslint/eslint-plugin", "jest", "import", "unused-imports"],
  extends: [
    "airbnb",
    "plugin:import/typescript",
    "next/core-web-vitals",
    "plugin:import/errors",
    "plugin:import/warnings",
    "prettier"
  ],
  globals: {
    JSX: true,
    globalThis: true,
    NodeJS: true
  },
  rules: {
    "func-style": ["error", "expression"],
    "prefer-regex-literals": "off",
    "react/no-unused-prop-types": "off",
    "react-hooks/exhaustive-deps": "off",
    "no-restricted-exports": "off",
    "no-unsafe-optional-chaining": "off",
    "react/no-unstable-nested-components": "off",
    "react/jsx-no-useless-fragment": "off",
    // jsx-a11y/label-has-for :is deprecated
    "jsx-a11y/label-has-for": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "jsx-a11y/interactive-supports-focus": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/label-has-associated-control": [
      2,
      {
        required: {
          some: ["nesting", "id"]
        }
      }
    ],
    "react/jsx-indent": "off",
    "camelcase": "off",
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
    "import/named": "error",
    "import/default": "error",
    "import/namespace": "error",
    "import/newline-after-import": ["error", { count: 1 }],
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "import/no-cycle": "off",
    "import/export": "error",
    "import/prefer-default-export": "off",
    "import/no-duplicates": "error",
    "no-restricted-syntax": "off",
    "no-irregular-whitespace": "warn",
    "react/no-access-state-in-setstate": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-case-declarations": "off",
    "class-methods-use-this": "off",
    "lines-between-class-members": "off",
    "no-nested-ternary": "off",
    "no-await-in-loop": "off",
    "no-continue": "off",
    "no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true
      }
    ],
    "no-shadow": "off",
    "no-unused-vars": "off",
    "no-return-await": "off",
    "no-promise-executor-return": "off",
    "no-array-constructor": "off",
    "object-curly-spacing": ["error", "always"],
    "semi": ["error", "never"],
    "no-multiple-empty-lines": ["error"],
    "no-restricted-imports": "off",
    "consistent-return": "off",
    "unused-imports/no-unused-imports": "error",
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
    /**
     * @description rules of @typescript-eslint
     */
    "@typescript-eslint/explicit-function-return-type": "off", // annoying to force return type
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
    /**
     * @description rules of eslint-plugin-react
     */
    "react/destructuring-assignment": "off",
    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".tsx", ".ts", ".jsx"]
      }
    ], // also want to use with ".tsx"
    "react/jsx-one-expression-per-line": "off",
    "react/prop-types": "off", // Is this incompatible with TS props type?
    "react/prefer-stateless-function": "off",
    "react/no-danger": "off",
    "react/jsx-wrap-multilines": "off",
    "react/jsx-props-no-spreading": "off",
    "no-use-before-define": "off",
    "arrow-body-style": "off",
    "react/jsx-fragments": "off",
    "react/jsx-curly-newline": "off",
    "react/require-default-props": "off",
    "react/state-in-constructor": "off",
    "react/no-array-index-key": "off",
    "react/function-component-definition": [
      2,
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function"
      }
    ],
    "react/jsx-no-constructed-context-values": "off",
    "react-hooks/rules-of-hooks": "error",
    "import/no-extraneous-dependencies": "off"
  },
  settings: {
    "import/resolver": {
      typescript: true
    }
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "no-undef": "off"
      }
    }
  ]
}
