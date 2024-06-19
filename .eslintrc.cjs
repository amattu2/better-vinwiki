/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb",
    "airbnb-typescript",
    "plugin:react-hooks/recommended",
    "react-app",
    "react-app/jest",
  ],
  globals: {
    window: true,
    document: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    project: "./tsconfig.json",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  settings: {
    react: {
      pragma: "React",
      fragment: "Fragment",
      version: "detect",
    },
  },
  root: true,
  rules: {
    "import/no-named-as-default": "warn",
    "react/jsx-indent": "warn",
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    "react/function-component-definition": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-shadow": "off",
    "@typescript-eslint/dot-notation": "off",
    "@typescript-eslint/quotes": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-empty-function": "warn",
    "no-console": "warn",
    "arrow-body-style": "warn",
    "eol-last": "warn",
    "object-curly-newline": "off",
    "no-underscore-dangle": "off",
    "max-len": "off",
    "no-param-reassign": "off",
    "no-continue": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "off",
  },
};

module.exports = config;
