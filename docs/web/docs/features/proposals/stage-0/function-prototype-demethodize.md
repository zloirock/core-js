# Function.prototype.demethodize
Specification: [proposal-function-demethodize](https://github.com/js-choi/proposal-function-demethodize)

## Module 
[`esnext.function.demethodize`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.demethodize.js)

```ts
class Function {
  demethodize(): Function;
}
```

[*CommonJS entry points:*](#commonjs-api)
```ts
core-js/proposals/function-demethodize
core-js(-pure)/full/function/demethodize
core-js(-pure)/full/function/virtual/demethodize
```

## Examples
```js
const slice = Array.prototype.slice.demethodize();

slice([1, 2, 3], 1); // => [2, 3]
```
