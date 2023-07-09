---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`String` padding](https://github.com/tc39/proposal-string-pad-start-end)

## Types

```ts
interface String {
  /**@param fillStr @default " " */
  padStart(length: number, fillStr?: string): string;
  /**@param fillStr @default " " */
  padEnd(length: number, fillStr?: string): string;
}
```

## Entry points

```
core-js/proposals/string-padding
```
