---
category: feature
tag:
  - es-proposal
---

# [`Array.isTemplateObject`](https://github.com/tc39/proposal-array-is-template-object)

## 模块

[`esnext.array.is-template-object`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.array.is-template-object.js)

## 类型

```ts
interface ArrayConstructor {
  isTemplateObject(value: any): boolean;
}
```

## 入口点

```
core-js/proposals/array-is-template-object
core-js(-pure)/full/array/is-template-object
```

## 示例

```js
console.log(Array.isTemplateObject(((it) => it)`qwe${123}asd`)); // => true
```
