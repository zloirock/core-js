---
category: development
icon: check
---

# Testing

Before testing, you should install dependencies:

```sh
npm i
```

You can run the most tests by

```sh
npm t
```

You can run parts of the test case separately:

- Linting:
  ```sh
  npm run lint
  ```
- Unit test case in Karma (modern Chromium, Firefox, WebKit (Playwright) and ancient WebKit (PhantomJS)):
  ```sh
  npx run-s init bundle test-unit-karma
  ```
- Unit test case in NodeJS:
  ```sh
  npx run-s init bundle test-unit-node
  ```
- Unit test case in Bun (it's not included in `npm t` since required installed Bun):
  ```sh
  npx run-s init bundle test-unit-bun
  ```
- [Test262](https://github.com/tc39/test262) test case (it's not included to the default tests):
  ```sh
  npx run-s init bundle-package test262
  ```
- [Promises/A+](https://github.com/promises-aplus/promises-tests) and [ES6 `Promise`](https://github.com/promises-es6/promises-es6) test cases:
  ```sh
  npx run-s init test-promises
  ```
- [ECMAScript `Observable` test case](https://github.com/tc39/proposal-observable):
  ```sh
  npx run-s init test-observables
  ```
- CommonJS entry points tests:
  ```sh
  npx run-s init test-entries
  ```
- `core-js-compat` tools tests:
  ```sh
  npx run-s init test-compat-tools
  ```
- `core-js-builder` tests:
  ```sh
  npx run-s init test-builder
  ```
- If you want to run tests in a certain browser, at first, you should build packages and test bundles:
  ```sh
  npx run-s init bundle
  ```
- For running the global version of the unit test case, use this file:
  ```sh
  tests/unit-browser/global.html
  ```
- For running the pure version of the unit test case, use this file:
  ```sh
  tests/unit-browser/pure.html
  ```
