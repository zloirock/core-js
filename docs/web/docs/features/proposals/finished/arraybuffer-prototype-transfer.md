# [`ArrayBuffer.prototype.transfer` and friends](https://github.com/tc39/proposal-arraybuffer-transfer)
```ts
class ArrayBuffer {
  readonly attribute detached: boolean;
  transfer(newLength?: number): ArrayBuffer;
  transferToFixedLength(newLength?: number): ArrayBuffer;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```
core-js/proposals/array-buffer-transfer
```
