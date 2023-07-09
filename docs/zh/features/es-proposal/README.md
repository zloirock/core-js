---
category: feature
---

# ECMAScript 提案

[TC39 流程。](https://tc39.github.io/process-document/)

# 索引

- [Finished](#finished)
- [Stage 3](#stage-3)
- [Stage 2](#stage-2)
- [Stage 1](#stage-1)
- [Stage 0](#stage-0)
- [Pre-stage 0](#pre-stage-0)

## Finished

Finished (stage 4) 提案已经在 Core-JS 中标记为稳定的 ECMAScript，可以在`core-js/stable`和`core-js/es`命名空间中找到（参见相关部分的文档）。但 Core-JS 仍旧提供了一种只引入特定提案的功能的方法，如`core-js/proposals/proposal-name`

### [`globalThis`](global-this.md)

### [ES 相关的索引方法](relative-indexing-method.md)

### [`Array.prototype.includes`](array-includes.md)

### [`Array.prototype.flat` / `Array.prototype.flatMap`](array-flat-map.md)

### [从最后开始查找 `Array`](array-find-from-last.md)

### [通过复制来改变 `Array`](change-array-by-copy.md)

### [`Object.values` / `Object.entries`](object-values-entries.md)

### [`Object.fromEntries`](object-from-entries.md)

### [`Object.getOwnPropertyDescriptors`](object-getownpropertydescriptors.md)

### [可访问的 `Object.prototype.hasOwnProperty`](accessible-object-hasownproperty.md)

### [`String` 填充](string-padding.md)

### [`String.prototype.matchAll`](string-match-all.md)

### [`String.prototype.replaceAll`](string-replace-all.md)

### [`String.prototype.trimStart` / `String.prototype.trimEnd`](string-left-right-trim.md)

### [`RegExp` `s` (`dotAll`) 标记](regexp-dotall-flag.md)

### [`RegExp` 命名捕获组](regexp-named-groups.md)

### [`Promise.allSettled`](promise-all-settled.md)

### [`Promise.any`](promise-any.md)

### [`Promise.prototype.finally`](promise-finally.md)

### [用于异步迭代的 `Symbol.asyncIterator`](async-iteration.md)

### [`Symbol.prototype.description`](symbol-description.md)

### [Well-formed `JSON.stringify`](well-formed-stringify.md)

### [结构良好的 unicode 字符串](well-formed-unicode-strings.md)

## Stage 3

`core-js/stage/3` 只包含 Stage 3 的提案，而`core-js/stage/2`则包含 Stage 2 到 Stage 3 的提案，以此类推……

入口点:

```
core-js(-pure)/stage/3
```

### [`Iterator` helper 函数](iterator-helpers.md)

### [`Array.fromAsync`](array-from-async.md)

### [`ArrayBuffer.prototype.transfer` 和相关的](array-buffer-transfer.md)

### [新的 `Set` 方法](new-set-methods.md)

### [`JSON.parse` 源文本访问](json-parse-with-source.md)

### [显式资源管理](explicit-resource-management.md)

### [装饰器元数据的 `Symbol.metadata` 提案](decorator-metadata.md)

## Stage 2

入口点:

```
core-js(-pure)/stage/2
```

### [`Array` 分组](array-grouping.md)

### [`AsyncIterator` helper 函数](async-iterator-helpers.md)

### [`Iterator.range`](iterator-range.md)

### [`Promise.withResolvers`](promise-with-resolvers.md)

### [`Map.prototype.emplace`](map-emplace.md)

### [`Array.isTemplateObject`](array-is-template-object.md)

### [`String.dedent`](string-dedent.md)

### [异步显式资源管理](async-explicit-resource-management.md)

### [`Symbol` 断言](symbol-predicates.md)

## Stage 1

入口点:

```
core-js(-pure)/stage/1
```

### [`Observable`](observable.md)

### [新的集合方法](collection-methods.md)

### [集合构造器的 `.of` 和 `.from` 方法](collection-of-from.md)

### [`compositeKey` 和 `compositeSymbol`](keys-composition.md)

### [`Array` 过滤器](array-filtering.md)

### [`Array` 去重](array-unique.md)

### [从最后开始查找 `Array`](array-find-from-last.md)

### [`Number.fromString`](number-from-string.md)

### [`Math` 拓展](math-extensions.md)

### [`Math.signbit`](math-signbit.md)

### [`String.cooked`](string-cooked.md)

### [`String.prototype.codePoints`](string-code-points.md)

### [用于模式匹配的 `Symbol.matcher`](pattern-matching.md)

## Stage 0

入口点:

```
core-js(-pure)/stage/0
```

### [`Function.prototype.demethodize`](function-demethodize.md)

### [`Function.{ isCallable, isConstructor }`](function-is-callable-is-constructor.md)

### [`URL`](url.md)

## Pre-stage 0

入口点:

```
core-js(-pure)/stage/pre
```

### [`Reflect` 元数据](reflect-metadata.md)
