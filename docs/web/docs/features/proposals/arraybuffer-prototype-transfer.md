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
```ts
core-js/proposals/array-buffer-transfer
```
