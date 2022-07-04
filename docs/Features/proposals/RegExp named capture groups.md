# [`RegExp` named capture groups](https://github.com/tc39/proposal-regexp-named-groups)
```js
// patched for support `RegExp` named capture groups:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  @@replace(string: string, replaceValue: Function | string): string;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js/proposals/regexp-named-groups
```