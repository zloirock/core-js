# String.dedent
[Specification](https://tc39.es/proposal-string-dedent/)\
[Proposal repo](https://github.com/tc39/proposal-string-dedent)

## Modules
[`esnext.string.dedent`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.dedent.js)

## Built-ins signatures
```ts
class String {
  static dedent(templateOrTag: { raw: Array<string> } | function, ...substitutions: Array<string>): string | function;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/string-dedent
core-js(-pure)/full/string/dedent
```

## Example
```js
const message = 42;

console.log(String.dedent`
  print('${ message }')
`); // => print('42')

String.dedent(console.log)`
  print('${ message }')
`; // => ["print('", "')", raw: Array(2)], 42
```
