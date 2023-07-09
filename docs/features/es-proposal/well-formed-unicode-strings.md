---
category: feature
tag:
  - es-proposal
---

# [Well-formed unicode strings](https://github.com/tc39/proposal-is-usv-string)

## Types
```ts
interface String {
  isWellFormed(): boolean;
  toWellFormed(): string;
}
```

## Entry points

```
core-js/proposals/well-formed-unicode-strings
```
