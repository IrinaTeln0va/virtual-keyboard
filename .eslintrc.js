module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
  },
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    "padding-line-between-statements": ["error", { blankLine: "always", prev: ["const", "let", "var"], next: "*" }, { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] }, { blankLine: "always", prev: "*", next: "if" }, { blankLine: "always", prev: "if", next: "*" }]
  },
};
