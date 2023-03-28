---
category: feature
tag:
  - es-standard
---

# `Date`

## 模块

- [`es.date.to-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-string.js)

_修复的 ES5 特性：_

- [`es.date.now`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.now.js)
- [`es.date.to-iso-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-iso-string.js)
- [`es.date.to-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-json.js)
- [`es.date.to-primitive`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-primitive.js)

_Annex B 方法模块：_

- [`es.date.get-year`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.get-year.js)
- [`es.date.set-year`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.set-year.js)
- [`es.date.to-gmt-string`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.date.to-gmt-string.js)

## 类型

```ts
interface Date {
  getYear(): number;
  setYear(year: number): number;
  toGMTString(): string;
  toISOString(): string;
  toJSON(): string;
  toString(): string;
  [Symbol.toPrimitive](hint: "default" | "number" | "string"): string | number;
}

interface DateConstructor {
  now(): number;
}
```

## 入口点

```
core-js/es|stable|actual|full/date
core-js/es|stable|actual|full/date/to-string
core-js(-pure)/es|stable|actual|full/date/now
core-js(-pure)/es|stable|actual|full/date/get-year
core-js(-pure)/es|stable|actual|full/date/set-year
core-js(-pure)/es|stable|actual|full/date/to-gmt-string
core-js(-pure)/es|stable|actual|full/date/to-iso-string
core-js(-pure)/es|stable|actual|full/date/to-json
core-js(-pure)/es|stable|actual|full/date/to-primitive
```

## 示例

[_示例_](https://goo.gl/haeHLR):

```js
new Date(NaN).toString(); // => 'Invalid Date'
```
