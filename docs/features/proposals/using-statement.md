# [`Symbol.{ asyncDispose, dispose }` for `using` statement](https://github.com/tc39/proposal-using-statement)
Modules [`esnext.symbol.dispose`](/packages/core-js/modules/esnext.symbol.dispose.js) and [`esnext.symbol.async-dispose`](/packages/core-js/modules/esnext.symbol.async-dispose.js).
```ts
class Symbol {
  static asyncDispose: @@asyncDispose;
  static dispose: @@dispose;
}
```
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js/proposals/using-statement
core-js(-pure)/full/symbol/async-dispose
core-js(-pure)/full/symbol/dispose
```
