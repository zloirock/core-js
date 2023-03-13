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

`core-js`试图支持所有可能的 JS 引擎和支持 ES3 的环境。某些特性有更高的下限，例如，_一些_ 访问器只能从 ES5 开始正常工作，承诺需要用于设置 microtask 或者 task 的方法……

然而，我不可能在所有地方测试`core-js`，例如在 IE7- 等古老设备上的测试已经停止。你可以通过下面的兼容性表格中看到通过充分测试的环境列表。如果你对任何环境的支持有疑问，请提出[issue](https://github.com/zloirock/core-js/issues)

## 关于`core-js-compat`

Core-JS 项目在[`core-js-compat`](/packages/core-js-compat)包中提供了所有关于`core-js`模块的必要性、入口点和所需的工具的数据——这对`babel`或`swc`等工具的集成很有用。
如果你愿意帮忙，可以看看[贡献一章](/dev/compat.md)中的相关部分

## 兼容性表格

- 原生支持此 API 的最小版本 { .true }
- 原生不支持此 API, 但可以通过`core-js`的 polyfill 实现 { .false }
- 暂无数据(可能因为测试脚本还没写 :sweat_smile: ) { .nodata }
