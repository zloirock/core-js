# `Uint8Array` to / from base64 and hex
[Specification](https://tc39.es/proposal-arraybuffer-base64/)\
[Proposal repo](https://github.com/tc39/proposal-arraybuffer-base64)

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
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-buffer-base64`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/array-buffer-base64.d.ts)
