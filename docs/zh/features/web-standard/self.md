---
category: feature
tag:
  - web-standard
---

# `self`

[规范](https://html.spec.whatwg.org/multipage/window-object.html#dom-self)

## 模块

[`web.self`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.self.js)

## 类型

```ts
interface Window {
  get self(): typeof globalThis;
}
```

## 入口点

```
core-js(-pure)/stable|actual|full/self
```

## 示例

[_示例_](https://tinyurl.com/27nghouh):

```js
self.Array === Array; // => true
```
