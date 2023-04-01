---
category: feature
tag:
  - web-standard
---

# Base64 公共方法

[规范](https://html.spec.whatwg.org/multipage/webappapis.html#atob)、 [MDN](https://developer.mozilla.org/en-US/docs/Glossary/Base64)。

## 模块

- [`web.atob`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.atob.js)
- [`web.btoa`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.btoa.js)

## 类型

```ts
function atob(data: string): string;
function btoa(data: string): string;
```

## 入口点

```
core-js(-pure)/stable|actual|full/atob
core-js(-pure)/stable|actual|full/btoa
```

## 示例

[_示例_](https://is.gd/4Nxmzn):

```js
btoa("hi, core-js"); // => 'aGksIGNvcmUtanM='
atob("aGksIGNvcmUtanM="); // => 'hi, core-js'
```
