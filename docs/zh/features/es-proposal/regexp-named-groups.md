# [`RegExp` named capture groups](https://github.com/tc39/proposal-regexp-named-groups)

## Types

```ts
// patched for support `RegExp` named capture groups:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  @@replace(string: string, replaceValue: Function | string): string;
}
```

## Entry points

```
core-js/proposals/regexp-named-groups
```
