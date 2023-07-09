---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [Well-formed `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify)

## Types

```ts
interface JSON {
  stringify(
    target: any,
    replacer?:
      | Array<string | number>
      | ((key: string, value: any) => any)
      | null,
    space?: string | number
  ): string | void;
}
```

## Entry points

```
core-js/proposals/well-formed-stringify
```
