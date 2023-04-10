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

## 支持的环境

`core-js` 致力于支持所有 JS 引擎和支持 ES3 的环境。某些特性有更高的门槛，例如 _一些_ 访问器最低只支持 ES5，promise 需要设置 microtask 或者 task 等。

然而，我们不可能在所有环境中测试 `core-js`，我们已经停止在古老的环境——比如 IE7——进行测试。下面的兼容性表格列举了经过充分测试的环境。如果你有任何关于环境支持的疑问，请提出[issue](https://github.com/zloirock/core-js/issues)。

## 关于 `core-js-compat`

Core-JS 项目在 [`core-js-compat`](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat) 包中提供了所有关于 `core-js` 模块的必要性、入口点和所需的工具的数据——这对`babel`或`swc`等工具的集成很有用。
如果你愿意帮忙，可以看看[贡献章节](dev/compat.md)中的相关部分

## 兼容性表格

- 原生支持此 API 的最低版本 { .true }
- 原生不支持此 API, 但可以通过 `core-js` 的 polyfill 实现 { .false }
- 暂无数据(可能因为测试脚本还没写 :sweat_smile: ) { .nodata }
