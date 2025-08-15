# `Float16` methods
[Specification](https://github.com/tc39/proposal-float16array)

```ts
class DataView {
  getFloat16(offset: any, littleEndian?: boolean = false): float16
  setFloat16(offset: any, value: any, littleEndian?: boolean = false): void;
}

namespace Math {
  fround(number: any): number;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/float16
```
