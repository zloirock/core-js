---
category: development
icon: form
---

# 更新`core-js-compat`

::: tip
如果你没有设备运行对应的浏览器，可以使用 [Sauce Labs](https://saucelabs.com/)、[BrowserStack](https://www.browserstack.com/) 以及[Cloud Browser](https://ieonchrome.com/)。
:::

## 更新现有数据

对于更新 `core-js-compat` 数据：

- 如果你想添加浏览器的数据，在浏览器里打开 `tests/compat/index.html`（实际发行版的测试和结果可以在[`兼容性表格`](../compat.md)中查到），然后你会看到这个浏览器需要哪些 Core-JS 模块。

![compat-table](/compat/screenshot.webp)

- 如果你想添加关于 NodeJS 的数据，使用已安装的需要的 NodeJS 版本运行 `npm run compat-node`，然后你会在控制台里看到结果。如果你想要 JSON 格式的结果，使用 `npm run compat-node json` 。
- 如果你想添加关于 Deno 的数据，使用已安装的需要的 Deno 版本运行 `npm run compat-deno`，然后你会在控制台里看到结果。如果你想要 JSON 格式的结果，使用 `npm run compat-deno json` 。
- 如果你想添加关于 Bun 的数据，使用已安装的需要的 Bun 版本运行 `npm run compat-bun`，然后你会在控制台里看到结果。
- 如果你想添加关于 Rhino 的数据，在 [`package.json`](https://github.com/zloirock/core-js/blob/master/package.json) 中的 `compat-rhino` NPM 脚本里设置需要的 Rhino 版本，运行 `compat-rhino` 后后你会在控制台里看到结果。
- 如果你想添加关于 Hermes（包括使用 React Native 交付的），运行 `npm run compat-hermes YOR_PATH_TO_HERMES`，然后你会在控制台里看到结果。
- 在获取到数据后把它添加到 [`packages/core-js-compat/src/data.mjs`](https://github.com/zloirock/core-js/blob/master/packages/core-js-compat/src/data.mjs) 中。

## 创建新的版本映射

如果你想要添加新的版本映射（比如基于 Safari 的新 iOS Safari 版本或者基于 Chrome 的 NodeJS），请把它添加到 [`packages/core-js-compat/src/mapping.mjs`](https://github.com/zloirock/core-js/blob/master/packages/core-js-compat/src/mapping.mjs)中。

| 引擎              | 如何运行测试 | 基础数据继承自            | 强制检查     | 用于新版本的映射                   |
| ----------------- | ------------ | ------------------------- | ------------ | ---------------------------------- |
| `android`         | 浏览器运行   | `chrome`,`chrome-android` |              |                                    |
| `bun`             | bun 运行     | `safari`（仅限 ES）       | 需要         |                                    |
| `chrome`          | 浏览器运行   |                           | 需要         |                                    |
| `chrome-android`  | 浏览器运行   | `chrome`                  |              |                                    |
| `deno`            | deno 运行    | `chrome`（仅限 ES）       | 非 ES 的功能 | 需要                               |
| `edge`            | 浏览器运行   | `ie`,`chrome`             | 需要（<=18） |                                    |
| `electron`        | 浏览器运行   | `chrome`                  |              | 需要                               |
| `firefox`         | 浏览器运行   |                           | 需要         |                                    |
| `firefox-android` | 浏览器运行   | `firefox`                 |              |                                    |
| `hermes`          | hermes 运行  |                           | 需要         |                                    |
| `ie`              | 浏览器运行   |                           | 需要         |                                    |
| `ios`             | 浏览器运行   | `safari`                  |              | 在不一致的情况下（除 `safari`）    |
| `node`            | node 运行    | `chrome`（仅限 ES）       | 非 ES 的功能 | 需要                               |
| `opera`           | 浏览器运行   | `chrome`                  |              | 在不一致的情况下（除 `chrome`-14） |
| `opera-android`   | 浏览器运行   | `opera`,`chrome-android`  |              | 需要                               |
| `phantom`         | 浏览器运行   | `safari`                  |              |                                    |
| `quest`           | 浏览器运行   | `chrome-android`          |              | 需要                               |
| `react-native`    | hermes 运行  | `hermes`                  | 需要         |                                    |
| `rhino`           | rhino 运行   |                           | 需要         |                                    |
| `safari`          | 浏览器运行   |                           | 需要         |                                    |
| `samsung`         | 浏览器运行   | `chrome-android`          |              | 需要                               |
