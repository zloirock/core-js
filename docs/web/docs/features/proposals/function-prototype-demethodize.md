# Function.prototype.demethodize
[Proposal repo](https://github.com/js-choi/proposal-function-demethodize)

## Module 
[`esnext.function.demethodize`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.function.demethodize.js)

## Built-ins signatures
```ts
class Function {
  demethodize(): Function;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js/proposals/function-demethodize
core-js(-pure)/full/function/demethodize
core-js(-pure)/full/function/prototype/demethodize
```

## Examples
```js
const slice = Array.prototype.slice.demethodize();

slice([1, 2, 3], 1); // => [2, 3]
```
