# `Float16`
[Specification](https://tc39.es/proposal-float16array/)\
[Proposal repo](https://github.com/tc39/proposal-float16array)

## Modules
[`es.data-view.get-float16`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.data-view.get-float16.js), [`es.data-view.set-float16`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.data-view.set-float16.js) and [`es.math.f16round`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.math.f16round.js).

## Built-ins signatures
```ts
class DataView {
  getFloat16(offset: any, littleEndian?: boolean = false): float16;
  setFloat16(offset: any, value: any, littleEndian?: boolean = false): void;
}

namespace Math {
  f16round(number: any): number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/float16
core-js/es|stable|actual|full/data-view/get-float16
core-js/es|stable|actual|full/data-view/set-float16
{ core-js, @core-js/pure }/es|stable|actual|full/math/f16round
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/float16`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/float16.d.ts)

## Examples
```js
Math.f16round(1.337); // => 1.3369140625

const view = new DataView(new ArrayBuffer(2));
view.setFloat16(0, 1.337);
view.getFloat16(0); // => 1.3369140625
```
