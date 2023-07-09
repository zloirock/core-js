---
category: development
icon: check
---

# 测试

在测试之前，请先安装依赖：

```sh
npm i
```

通过以下命令来运行常用的测试：

```sh
npm t
```

你也可以单独运行一部分测试：

- Linting：
  ```sh
  npm run lint
  ```
- 使用 Karma 在 modern Chromium、Firefox、WebKit (Playwright) 以及 ancient WebKit （PhantomJS）中运行单元测试：
  ```sh
  npx run-s init bundle test-unit-karma
  ```
- 在 NodeJS 中运行单元测试：
  ```sh
  npx run-s init bundle test-unit-node
  ```
- 在 Bun 中运行单元测试 （因需要单独安装 Bun，所以并未包含在 `npm t` 中）：
  ```sh
  npx run-s init bundle test-unit-bun
  ```
- 运行 [Test262](https://github.com/tc39/test262) 测试（并未包含在默认测试中）：
  ```sh
  npx run-s init bundle-package test262
  ```
- 运行 [Promises/A+](https://github.com/promises-aplus/promises-tests) 和 [ES6 `Promise`](https://github.com/promises-es6/promises-es6) 测试用例：
  ```sh
  npx run-s init test-promises
  ```
- [ECMAScript `Observable` 测试用例](https://github.com/tc39/proposal-observable)：
  ```sh
  npx run-s init test-observables
  ```
- CommonJS 入口点测试：
  ```sh
  npx run-s init test-entries
  ```
- `core-js-compat` 工具测试：
  ```sh
  npx run-s init test-compat-tools
  ```
- `core-js-builder` 测试：
  ```sh
  npx run-s init test-builder
  ```
- 如果你想在某个浏览器中运行测试，你应该首先构建 package 并测试：
  ```sh
  npx run-s init bundle
  ```
- 使用这个文件来运行全局版本的单元测试：
  ```sh
  tests/unit-browser/global.html
  ```
- 如果要运行 pure 版本的单元测试，请使用下列文件：
  ```sh
  tests/unit-browser/pure.html
  ```
