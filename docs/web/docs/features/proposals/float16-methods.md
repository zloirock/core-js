# `Float16` methods
[Specification](https://tc39.es/proposal-float16array/)\
[Proposal repo](https://github.com/tc39/proposal-float16array)

## Built-ins signatures
```ts
class DataView {
  getFloat16(offset: any, littleEndian?: boolean = false): float16
  setFloat16(offset: any, value: any, littleEndian?: boolean = false): void;
}

namespace Math {
  fround(number: any): number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js/proposals/float16
```
