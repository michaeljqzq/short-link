module.exports = {
  "env": {
    node: true,
    browser: true,
  },
  "parser": "babel-eslint",
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "plugins": ["react"],
  "rules": {
    "no-console": 0,
    "react/prop-types": 0,
  }
};