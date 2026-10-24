# `RegExp` `s` (`dotAll`) flag
[Specification](https://tc39.es/proposal-regexp-dotall-flag/)\
[Proposal repo](https://github.com/tc39/proposal-regexp-dotall-flag)

## Modules
[`es.regexp.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.constructor.js), [`es.regexp.dot-all`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.dot-all.js), [`es.regexp.exec`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.exec.js) and [`es.regexp.flags`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.regexp.flags.js).

## Built-ins signatures
```ts
// patched to support the `RegExp` dotAll (`s`) flag:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(string: string): Array<string | undefined> | null;
  readonly attribute dotAll: boolean;
  readonly attribute flags: string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/regexp-dotall-flag
core-js/es|stable|actual|full/regexp/constructor
core-js/es|stable|actual|full/regexp/dot-all
{ core-js, @core-js/pure }/es|stable|actual|full/regexp/flags
```

## Examples
```js
RegExp('.', 's').test('\n'); // => true
RegExp('.', 's').dotAll;     // => true
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/regexp-dotall-flag`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/regexp-dotall-flag.d.ts)
