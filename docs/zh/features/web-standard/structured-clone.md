---
category: feature
tag:
  - web-standard
---

# `structuredClone`

[规范](https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone)

## 模块

[`web.structured-clone`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.structured-clone.js)

## 类型

```ts
function structuredClone<T extends Transferable>(
  value: T,
  options: { transfer?: Sequence<Transferable> }
): T;
```

## 入口点

```
core-js(-pure)/stable|actual|full/structured-clone
```

## 示例

[_示例_](https://is.gd/RhK7TW):

```js
const structured = [{ a: 42 }];
const sclone = structuredClone(structured);
console.log(sclone); // => [{ a: 42 }]
console.log(structured !== sclone); // => true
console.log(structured[0] !== sclone[0]); // => true

const circular = {};
circular.circular = circular;
const cclone = structuredClone(circular);
console.log(cclone.circular === cclone); // => true

structuredClone(42); // => 42
structuredClone({ x: 42 }); // => { x: 42 }
structuredClone([1, 2, 3]); // => [1, 2, 3]
structuredClone(new Set([1, 2, 3])); // => Set{ 1, 2, 3 }
structuredClone(
  new Map([
    ["a", 1],
    ["b", 2],
  ])
); // => Map{ a: 1, b: 2 }
structuredClone(new Int8Array([1, 2, 3])); // => new Int8Array([1, 2, 3])
structuredClone(new AggregateError([1, 2, 3], "message")); // => new AggregateError([1, 2, 3], 'message'))
structuredClone(new TypeError("message", { cause: 42 })); // => new TypeError('message', { cause: 42 })
structuredClone(new DOMException("message", "DataCloneError")); // => new DOMException('message', 'DataCloneError')
structuredClone(document.getElementById("myfileinput")); // => new FileList
structuredClone(new DOMPoint(1, 2, 3, 4)); // => new DOMPoint(1, 2, 3, 4)
structuredClone(new Blob(["test"])); // => new Blob(['test'])
structuredClone(new ImageData(8, 8)); // => new ImageData(8, 8)
// etc.

structuredClone(new WeakMap()); // => DataCloneError on non-serializable types
```

## 使用 `structuredClone` polyfill 时的注意事项：

- `ArrayBuffer` 实例和很多平台类型不能被转移到大多数引擎中，因为我们无法 polyfill 这个行为，但是 `.transfer` 选项在一些平台类型中可以工作。我建议避开这个选项。
- 一些特定的平台类型不能被复制到老引擎中。主要是非常特别的类型或者非常老的引擎，但是也有一些例外。例如我们无法同步复制 `ImageBitmap` 到 Safari 14.0- 或者 Firefox 83- 中，所以如果你想复制一些东西到特定平台的话，建议看看 [polyfill 源码](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.structured-clone.js)。
