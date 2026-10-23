# `Uint8Array` to/from base64 and hex
[Specification](https://tc39.es/proposal-arraybuffer-base64/)\
[Proposal repo](https://github.com/tc39/proposal-arraybuffer-base64)

## Modules
[`es.uint8-array.from-base64`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.from-base64.js), [`es.uint8-array.from-hex`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.from-hex.js), [`es.uint8-array.set-from-base64`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.set-from-base64.js), [`es.uint8-array.set-from-hex`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.set-from-hex.js), [`es.uint8-array.to-base64`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.to-base64.js) and [`es.uint8-array.to-hex`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.uint8-array.to-hex.js).

## Built-ins signatures
```ts
class Uint8Array {
  static fromBase64(string: string, options?: { alphabet?: 'base64' | 'base64url', lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial' }): Uint8Array;
  static fromHex(string: string): Uint8Array;
  setFromBase64(string: string, options?: { alphabet?: 'base64' | 'base64url', lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial' }): { read: uint, written: uint };
  setFromHex(string: string): { read: uint, written: uint };
  toBase64(options?: { alphabet?: 'base64' | 'base64url', omitPadding?: boolean }): string;
  toHex(): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-buffer-base64
core-js/es|stable|actual|full/typed-array/from-base64
core-js/es|stable|actual|full/typed-array/from-hex
core-js/es|stable|actual|full/typed-array/set-from-base64
core-js/es|stable|actual|full/typed-array/set-from-hex
core-js/es|stable|actual|full/typed-array/to-base64
core-js/es|stable|actual|full/typed-array/to-hex
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-buffer-base64`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/array-buffer-base64.d.ts)

## Examples
```js
let arr = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
arr.toBase64(); // => 'SGVsbG8gV29ybGQ='
arr.toBase64({ omitPadding: true }); // => 'SGVsbG8gV29ybGQ'
arr.toHex(); // => '48656c6c6f20576f726c64'
Uint8Array.fromBase64('SGVsbG8gV29ybGQ='); // => Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100])
Uint8Array.fromHex('48656c6c6f20576f726c64'); // => Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100])
```
