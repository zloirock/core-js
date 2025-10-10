# Number.prototype.clamp
[Specification](https://tc39.es/proposal-math-clamp/)\
[Proposal repo](https://github.com/tc39/proposal-math-clamp)

## Modules
[`esnext.number.clamp`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.number.clamp.js)

## Built-ins signatures
```ts
class Number {
  clamp(min: number, max: number): number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js/proposals/math-clamp-v2
core-js(-pure)/full/number/clamp
```

## Example
```js
5.0.clamp(0, 10); // => 5
-5.0.clamp(0, 10); // => 0
15.0.clamp(0, 10); // => 10
````
