---
category: feature
tag:
  - web-standard
---

# `self`

[Spec](https://html.spec.whatwg.org/multipage/window-object.html#dom-self)

## Module

[`web.self`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.self.js)

## Types

```ts
interface Window {
  get self(): typeof globalThis;
}
```

## Entry points

```
core-js(-pure)/stable|actual|full/self
```

## Example

[_Examples_](https://tinyurl.com/27nghouh):

```js
self.Array === Array; // => true
```
