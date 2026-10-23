# `String.prototype.matchAll`
[Proposal repo](https://github.com/tc39/proposal-string-matchall)

## Modules
[`es.string.match-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.match-all.js).

## Built-ins signatures
```ts
class String {
  matchAll(regexp: RegExp): Iterator;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/string-match-all
core-js(-pure)/es|stable|actual|full/string(/virtual)/match-all
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/string-match-all`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/string-match-all.d.ts)

## Examples
```js
for (let { groups: { number, letter } } of '1111a2b3cccc'.matchAll(RegExp('(?<number>\\d)(?<letter>\\D)', 'g'))) {
  console.log(number, letter); // -> 1 a, 2 b, 3 c
}
```
