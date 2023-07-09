---
category: feature
tag:
  - es-proposal
---

# [`Reflect` 元数据](https://github.com/rbuckton/reflect-metadata)

## 模块

- [`esnext.reflect.define-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.define-metadata.js)
- [`esnext.reflect.delete-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.delete-metadata.js)
- [`esnext.reflect.get-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.get-metadata.js)
- [`esnext.reflect.get-metadata-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.get-metadata-keys.js)
- [`esnext.reflect.get-own-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.get-own-metadata.js)
- [`esnext.reflect.get-own-metadata-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.get-own-metadata-keys.js)
- [`esnext.reflect.has-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.has-metadata.js)
- [`esnext.reflect.has-own-metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.has-own-metadata.js)
- [`esnext.reflect.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.reflect.metadata.js)

## 类型

```ts
namespace Reflect {
  function defineMetadata(
    metadataKey: any,
    metadataValue: any,
    target: Object,
    propertyKey?: PropertyKey
  ): void;
  function getMetadata(
    metadataKey: any,
    target: Object,
    propertyKey?: PropertyKey
  ): any;
  function getOwnMetadata(
    metadataKey: any,
    target: Object,
    propertyKey?: PropertyKey
  ): any;
  function hasMetadata(
    metadataKey: any,
    target: Object,
    propertyKey?: PropertyKey
  ): boolean;
  function hasOwnMetadata(
    metadataKey: any,
    target: Object,
    propertyKey?: PropertyKey
  ): boolean;
  function deleteMetadata(
    metadataKey: any,
    target: Object,
    propertyKey?: PropertyKey
  ): boolean;
  function getMetadataKeys(
    target: Object,
    propertyKey?: PropertyKey
  ): Array<any>;
  function getOwnMetadataKeys(
    target: Object,
    propertyKey?: PropertyKey
  ): Array<any>;
  function metadata(
    metadataKey: any,
    metadataValue: any
  ): (target: Object, targetKey: string | symbol) => void;
}
```

## 入口点

```
core-js/proposals/reflect-metadata
core-js(-pure)/full/reflect/define-metadata
core-js(-pure)/full/reflect/delete-metadata
core-js(-pure)/full/reflect/get-metadata
core-js(-pure)/full/reflect/get-metadata-keys
core-js(-pure)/full/reflect/get-own-metadata
core-js(-pure)/full/reflect/get-own-metadata-keys
core-js(-pure)/full/reflect/has-metadata
core-js(-pure)/full/reflect/has-own-metadata
core-js(-pure)/full/reflect/metadata
```

## 示例

[_示例_](https://goo.gl/KCo3PS):

```js
let object = {};
Reflect.defineMetadata("foo", "bar", object);
Reflect.ownKeys(object); // => []
Reflect.getOwnMetadataKeys(object); // => ['foo']
Reflect.getOwnMetadata("foo", object); // => 'bar'
```
