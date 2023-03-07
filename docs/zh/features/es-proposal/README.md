# ECMAScript 提案

[The TC39 process.](https://tc39.github.io/process-document/)

# 索引

- [Finished](#finished)
- [Stage 3](#stage-3)
- [Stage 2](#stage-2)
- [Stage 1](#stage-1)
- [Stage 0](#stage-0)
- [Pre-stage 0](#pre-stage-0)

## Finished

Finished (stage 4) 提案已经在`core-js`中标记为稳定的 ECMAScript，可以在`core-js/stable`和`core-js/es`命名空间中找到（参见相关部分的文档）。但`core-js`仍旧提供了一种只引入特定提案的功能的方法，如`core-js/proposals/proposal-name`

### [`globalThis`](global-this.md)

### [Relative indexing method](relative-indexing-method.md)

### [`Array.prototype.includes`](array-includes.md)

### [`Array.prototype.flat` / `Array.prototype.flatMap`](array-flat-map.md)

### [`Array` find from last](array-find-from-last.md)

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

## Stage 3

`core-js/stage/3` 只包含 Stage 3 的提案，而`core-js/stage/2`则包含 Stage 2 到 Stage 3 的提案，以此类推……

Entry points:

```
core-js(-pure)/stage/3
```

### [`Array` grouping](array-grouping.md)

### [Change `Array` by copy](change-array-by-copy.md)

## Stage 2

Entry points:

```
core-js(-pure)/stage/2
```

### [`Iterator` helpers](iterator-helpers.md)

### [New `Set` methods](set-methods.md)

### [`Map.prototype.emplace`](map-upsert.md)

### [`Array.fromAsync`](array-from-async.md)

### [`Array.isTemplateObject`](array-is-template-object.md)

### [`Symbol.{ asyncDispose, dispose }` for `using` statement](using-statement.md)

### [`Symbol.metadataKey` for decorators metadata proposal](decorator-metadata.md)

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

### [`Number.range`](number-range.md)

### [`Number.fromString`](number-from-string.md)

### [`Math` extensions](math-extensions.md)

### [`Math.signbit`](math-signbit.md)

### [`String.cooked`](string-cooked.md)

### [`String.prototype.codePoints`](string-code-points.md)

### [`Symbol.matcher` for pattern matching](pattern-matching.md)

### [Seeded pseudo-random numbers](seeded-random.md)

## Stage 0

Entry points:

```
core-js(-pure)/stage/0
```

### [`Function.prototype.unThis`](function-un-this.md)

### [`Function.{ isCallable, isConstructor }`](function-is-callable-is-constructor.md)

### [`URL`](url.md)

## Pre-stage 0

Entry points:

```
core-js(-pure)/stage/pre
```

### [`Reflect` metadata](reflect-metadata.md)
