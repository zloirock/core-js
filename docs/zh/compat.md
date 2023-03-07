---
title: 兼容性信息
icon: form
sidebar: false
layout: CompatPage
Pagehead:
  - - script
    - nomodule: ""
      src: /compat/compat-data.js
  - - script
    - nomodule: ""
      src: /compat/tests.js
  - - script
    - nomodule: ""
      src: /compat/legacy-runner.js
---

## 关于

`core-js`项目提供（[`core-js-compat`](/packages/core-js-compat)包）所有关于`core-js`模块的必要性、入口点和所需的工具的数据————这对`babel`或`swc`等工具的集成很有用。如果你想帮忙，可以看看[贡献一章](/dev/README.md#how-to-update core-js-compat-data)的相关部分
兼容性信息的表格和本地测试可以在下方找到

支持的环境:
::: details

- Chrome 26+
- Firefox 4+
- Safari 5+
- Opera 12+
- Internet Explorer 8+ (sure, IE8 with ES3 limitations; IE7- 也应该可用, 但不在测试)
- Edge
- Android Browser 2.3+
- iOS Safari 5.1+
- PhantomJS 1.9+
- NodeJS 0.8+
- Deno 1.0+
- Rhino 1.7.14+

……
:::

但这并不意味着 `core-js` 不能在其它环境下工作, 仅仅是没有进行测试而已.

## 兼容性表格

- 原生支持此 API 的最小版本 { .true }
- 原生不支持此 API, 但可以通过`core-js`的 polyfill 实现 { .false }
- 暂无数据(可能因为测试脚本还没写 :sweat_smile: ) { .nodata }
