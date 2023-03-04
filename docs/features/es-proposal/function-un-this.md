# [`Function.prototype.unThis`](https://github.com/js-choi/proposal-function-un-this)

Module [`esnext.function.un-this`](/packages/core-js/modules/esnext.function.un-this.js)

## Types

```ts
class Function {
  unThis(): Function;
}
```

## Entry points



```
core-js/proposals/function-un-this
core-js(-pure)/full/function/un-this
core-js(-pure)/full/function/virtual/un-this
```

[_Examples_](https://is.gd/t1Bvhn):

```js
const slice = Array.prototype.slice.unThis();

slice([1, 2, 3], 1); // => [2, 3]
```
