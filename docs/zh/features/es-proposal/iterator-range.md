---
category: feature
tag:
  - es-proposal
---

# [`Iterator.range`](https://github.com/tc39/proposal-Number.range)

## 模块

[`esnext.iterator.range`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.number.range.js)

## 类型

```ts
interface Iterator<T> {
  /** @param options  @default {step: 1, inclusive: false}*/
  range(
    start: number,
    end: number,
    options: { step?: number; inclusive?: boolean }
  ): Iterator<number>;
  /** @param options  @default {step: 1n, inclusive: false}*/
  range(
    start: bigint,
    end: bigint | number,
    options: { step?: bigint; inclusive?: boolean }
  ): Iterator<bigint>;
}
```

## 入口点

```
core-js/proposals/number-range
core-js(-pure)/full/iterator/range
```

## 示例

[_示例_](https://tinyurl.com/2gobe777):

```js
for (const i of Iterator.range(1, 10)) {
  console.log(i); // => 1, 2, 3, 4, 5, 6, 7, 8, 9
}

for (const i of Iterator.range(1, 10, { step: 3, inclusive: true })) {
  console.log(i); // => 1, 4, 7, 10
}
```
