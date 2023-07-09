---
category: feature
tag:
  - es-proposal
---

# [对象迭代](https://github.com/tc39/proposal-object-iteration)

::: warning
**该提案已被撤回，并将从下一个主要的 Core-JS 版本中删除。**
:::

## 模块

- [`esnext.object.iterate-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.iterate-keys.js)
- [`esnext.object.iterate-values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.iterate-values.js)
- [`esnext.object.iterate-entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.object.iterate-entries.js).

## 类型

```ts
class Object {
  iterateKeys(object: any): Iterator<string>;
  iterateValues(object: any): Iterator<any>;
  iterateEntries(object: any): Iterator<[string, any]>;
}
```

## 入口点

```
core-js/proposals/object-iteration
core-js(-pure)/full/object/iterate-keys
core-js(-pure)/full/object/iterate-values
core-js(-pure)/full/object/iterate-entries
```

## 示例

[_示例_](https://is.gd/Wnm2tD):

```js
const obj = { foo: "bar", baz: "blah" };

for (const [key, value] of Object.iterateEntries(obj)) {
  console.log(`${key} -> ${value}`);
}

for (const key of Object.iterateKeys(obj)) {
  console.log(key);
}

for (const value of Object.iterateValues(obj)) {
  console.log(value);
}
```
