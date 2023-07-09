---
category: feature
---

# ECMAScript Proposals

[The TC39 process.](https://tc39.github.io/process-document/)

# Index

- [Finished](#finished)
- [Stage 3](#stage-3)
- [Stage 2](#stage-2)
- [Stage 1](#stage-1)
- [Stage 0](#stage-0)
- [Pre-stage 0](#pre-stage-0)

## Finished

Finished (stage 4) proposals already marked in Core-JS as stable ECMAScript, they are available in `core-js/stable` and `core-js/es` namespace, you can find then in related sections of this doc. However, even for finished proposals, Core-JS provide a way to include only features for a specific proposal like `core-js/proposals/proposal-name`.

### [`globalThis`](global-this.md)

### [Relative indexing method](relative-indexing-method.md)

### [`Array.prototype.includes`](array-includes.md)

### [`Array.prototype.flat` / `Array.prototype.flatMap`](array-flat-map.md)

### [`Array` find from last](array-find-from-last.md)

### [Change `Array` by copy](change-array-by-copy.md)

### [`Object.values` / `Object.entries`](object-values-entries.md)

### [`Object.fromEntries`](object-from-entries.md)

### [`Object.getOwnPropertyDescriptors`](object-getownpropertydescriptors.md)

### [Accessible `Object.prototype.hasOwnProperty`](accessible-object-hasownproperty.md)

### [`String` padding](string-padding.md)

### [`String.prototype.matchAll`](string-match-all.md)

### [`String.prototype.replaceAll`](string-replace-all.md)

### [`String.prototype.trimStart` / `String.prototype.trimEnd`](string-left-right-trim.md)

### [`RegExp` `s` (`dotAll`) flag](regexp-dotall-flag.md)

### [`RegExp` named capture groups](regexp-named-groups.md)

### [`Promise.allSettled`](promise-all-settled.md)

### [`Promise.any`](promise-any.md)

### [`Promise.prototype.finally`](promise-finally.md)

### [`Symbol.asyncIterator` for asynchronous iteration](async-iteration.md)

### [`Symbol.prototype.description`](symbol-description.md)

### [Well-formed `JSON.stringify`](well-formed-stringify.md)

### [Well-formed unicode strings](well-formed-unicode-strings.md)

## Stage 3

`core-js/stage/3` entry point contains only stage 3 proposals, `core-js/stage/2` - stage 2 and stage 3, etc.

Entry points:

```
core-js(-pure)/stage/3
```

### [`Iterator` helpers](iterator-helpers.md)

### [`Array.fromAsync`](array-from-async.md)

### [`ArrayBuffer.prototype.transfer` and friends](array-buffer-transfer.md)

### [New `Set` methods](new-set-methods.md)

### [`JSON.parse` source text access](json-parse-with-source.md)

### [Explicit resource management](explicit-resource-management.md)

### [`Symbol.metadata` for decorators metadata proposal](decorator-metadata.md)

## Stage 2

Entry points:

```
core-js(-pure)/stage/2
```

### [`Array` grouping](array-grouping.md)

### [`AsyncIterator` helpers](async-iterator-helpers.md)

### [`Iterator.range`](iterator-range.md)

### [`Promise.withResolvers`](promise-with-resolvers.md)

### [`Map.prototype.emplace`](map-emplace.md)

### [`Array.isTemplateObject`](array-is-template-object.md)

### [`String.dedent`](string-dedent.md)

### [Async explicit resource management](async-explicit-resource-management.md)

### [`Symbol` predicates](symbol-predicates.md)

## Stage 1

Entry points:

```
core-js(-pure)/stage/1
```

### [`Observable`](observable.md)

### [New collections methods](collection-methods.md)

### [`.of` and `.from` methods on collection constructors](collection-of-from.md)

### [`compositeKey` and `compositeSymbol`](keys-composition.md)

### [`Array` filtering](array-filtering.md)

### [`Array` deduplication](array-unique.md)

### [Getting last item from `Array`](array-find-from-last.md)

### [`Number.fromString`](number-from-string.md)

### [`Math` extensions](math-extensions.md)

### [`Math.signbit`](math-signbit.md)

### [`String.cooked`](string-cooked.md)

### [`String.prototype.codePoints`](string-code-points.md)

### [`Symbol.matcher` for pattern matching](pattern-matching.md)

## Stage 0

Entry points:

```
core-js(-pure)/stage/0
```

### [`Function.prototype.demethodize`](function-demethodize.md)

### [`Function.{ isCallable, isConstructor }`](function-is-callable-is-constructor.md)

### [`URL`](url.md)

## Pre-stage 0

Entry points:

```
core-js(-pure)/stage/pre
```

### [`Reflect` metadata](reflect-metadata.md)
