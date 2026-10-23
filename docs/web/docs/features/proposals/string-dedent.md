# `String.dedent`
[Specification](https://tc39.es/proposal-string-dedent/)\
[Proposal repo](https://github.com/tc39/proposal-string-dedent)

## Modules
[`esnext.string.dedent`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.string.dedent.js).

## Built-ins signatures
```ts
class String {
  static dedent(templateOrTag: { raw: ReadonlyArray<string> } | function, ...substitutions: Array<string>): string | function;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/string-dedent
core-js(-pure)/full/string/dedent
```

`core-js` requires `raw` to be an object and, where freezing is supported, frozen. This is an intentional restriction while the proposal's [caching semantics remain under discussion](https://github.com/tc39/proposal-string-dedent/issues/75). A TypeScript `readonly` type alone does not freeze an array; use `Object.freeze` when constructing `raw` manually. Transpiled tagged templates must preserve freezing too: TypeScript's `__makeTemplateObject` helper and Babel's `loose` / `mutableTemplateObject` output can produce unfrozen arrays that this polyfill rejects.

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/string-dedent`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/string-dedent.d.ts)

## Examples
```js
const message = 42;

console.log(String.dedent`
  print('${ message }')
`); // -> print('42')

String.dedent(console.log)`
  print('${ message }')
`; // -> ["print('", "')", raw: Array(2)], 42
```
