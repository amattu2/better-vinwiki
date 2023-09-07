module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'airbnb',
      'airbnb-typescript',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      },
      ecmaVersion: 11,
      project: "./tsconfig.json",
      sourceType: "module"
    },
    plugins: ["react", "@typescript-eslint"],
    settings: {
      react: {
        pragma: "React",
        fragment: "Fragment",
        version: "detect"
      }
    },
    root: true,
    rules: {
      "no-empty-function": "warn",
      "prettier/prettier": "off",
      "import/no-unresolved": "off",
      "import/extensions": "off",
      "react/display-name": "off",
      "@typescript-eslint/comma-dangle": "off",
      "import/prefer-default-export": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "comma-dangle": "off",
      "max-len": "off",
      "no-console": "warn",
      "no-param-reassign": "off",
      "no-plusplus": "off",
      "no-return-assign": "off",
      "object-curly-newline": "off",
      "react/jsx-props-no-spreading": "off",
      "react/react-in-jsx-scope": "off",
      "react/require-default-props": "off",
      "typescript-eslint/no-unused-vars": "off",
      "import/no-extraneous-dependencies": "off",
      "react/no-unescaped-entities": "off",
      "react/forbid-prop-types": "off",
      "react/jsx-max-props-per-line": [
        1,
        {
          maximum: 2,
          when: "multiline"
        }
      ],
      indent: "off",
      "react/jsx-indent": ["warn"],
      "@typescript-eslint/indent": [0],
      "no-underscore-dangle": ["off"],
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": ["off"],
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-shadow": ["off"],
      "@typescript-eslint/dot-notation": ["off"],
      "@typescript-eslint/quotes": ["off"],
      "react/prop-types": ["off"],
      "@typescript-eslint/naming-convention": ["off"],
      "react/function-component-definition": ["off"],
      "arrow-body-style": ["warn"],
      "@typescript-eslint/ban-ts-comment": ["off"],
      "eol-last": ["warn"],
    }
  };
