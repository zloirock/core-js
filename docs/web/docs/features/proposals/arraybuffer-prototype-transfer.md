# `ArrayBuffer.prototype.transfer` and friends
[Specification](https://tc39.es/proposal-arraybuffer-transfer/)\
[Proposal repo](https://github.com/tc39/proposal-arraybuffer-transfer)

## Built-ins signatures
```ts
class ArrayBuffer {
  readonly attribute detached: boolean;
  transfer(newLength?: number): ArrayBuffer;
  transferToFixedLength(newLength?: number): ArrayBuffer;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-buffer-transfer
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-buffer-transfer`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/array-buffer-transfer.d.ts)
