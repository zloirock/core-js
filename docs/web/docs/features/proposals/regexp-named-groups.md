# `RegExp` named capture groups
[Specification](https://tc39.es/proposal-regexp-named-groups/)\
[Proposal repo](https://github.com/tc39/proposal-regexp-named-groups)

## Modules
[`es.regexp.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.regexp.constructor.js), [`es.regexp.exec`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.regexp.exec.js) and [`es.string.replace`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.replace.js).

## Built-ins signatures
```ts
// patched to support `RegExp` named capture groups:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(string: string): Array<string | undefined> | null;
  @@replace(string: string, replaceValue: Function | string): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/regexp-named-groups
core-js/es|stable|actual|full/regexp/constructor
core-js/es|stable|actual|full/regexp/replace
core-js/es|stable|actual|full/string/replace
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/regexp-named-groups`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/regexp-named-groups.d.ts)

## Examples
```js
RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)').exec('foo:abc,bar:def').groups; // => { foo: 'abc', bar: 'def' }

'foo:abc,bar:def'.replace(RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)'), '$<bar>,$<foo>'); // => 'def,abc'
```
