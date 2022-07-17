# tc39 ES Proposals
Polyfills for potential future JS additions.

# Index
- [Finished](#finished)
- [Stage 3](#stage-3)
- [Stage 2](#stage-2)
- [Stage 1](#stage-1)
- [Stage 0](#stage-0)
- [Pre-stage 0](#pre-stage-0)

# Finished[⬆](#index)
Finished (stage 4) proposals already marked in `core-js` as stable ECMAScript, they are available in `core-js/stable` and `core-js/es` namespace, you can find then in related sections of this doc. However, even for finished proposals, `core-js` provide a way to include only features for a specific proposal like `core-js/proposals/proposal-name`.
## [`globalThis`](global-this.md)
## [Relative indexing method](relative-indexing-method.md)
## [`Array.prototype.includes`](array-includes.md)
## [`Array.prototype.flat` / `Array.prototype.flatMap`](array-flat-map.md)
## [`Array` find from last](array-find-from-last.md)
## [`Object.values` / `Object.entries`](object-values-entries.md)
## [`Object.fromEntries`](object-from-entries.md)
## [`Object.getOwnPropertyDescriptors`](object-getownpropertydescriptors.md)
## [Accessible `Object.prototype.hasOwnProperty`](accessible-object-hasownproperty.md)
## [`String` padding](string-padding.md)
## [`String.prototype.matchAll`](string-match-all.md)
## [`String.prototype.replaceAll`](string-replace-all.md)
## [`String.prototype.trimStart` / `String.prototype.trimEnd`](string-left-right-trim.md)
## [`RegExp` `s` (`dotAll`) flag](regexp-dotall-flag.md)
## [`RegExp` named capture groups](regexp-named-groups.md)
## [`Promise.allSettled`](promise-all-settled.md)
## [`Promise.any`](promise-any.md)
## [`Promise.prototype.finally`](promise-finally.md)
## [`Symbol.asyncIterator` for asynchronous iteration](async-iteration.md)
## [`Symbol.prototype.description`](symbol-description.md)
## [Well-formed `JSON.stringify`](well-formed-stringify.md)

# Stage 3[⬆](#index)
`core-js/stage/3` entry point contains only stage 3 proposals, `core-js/stage/2` - stage 2 and stage 3, etc.
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js(-pure)/stage/3
```
## [`Array` grouping](array-grouping.md)
## [Change `Array` by copy](change-array-by-copy.md)

# Stage 2[⬆](#index)
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js(-pure)/stage/2
```
## [`Iterator` helpers](iterator-helpers.md)
## [New `Set` methods](set-methods.md)
## [`Map.prototype.emplace`](map-upsert.md)
## [`Array.fromAsync`](array-from-async.md)
## [`Array.isTemplateObject`](array-is-template-object.md)
## [`Symbol.{ asyncDispose, dispose }` for `using` statement](using-statement.md)
## [`Symbol.metadataKey` for decorators metadata proposal](decorator-metadata.md)

# Stage 1[⬆](#index)
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js(-pure)/stage/1
```
## [`Observable`](observable.md)
## [New collections methods](collection-methods.md)
## [`.of` and `.from` methods on collection constructors](collection-of-from.md)
## [`compositeKey` and `compositeSymbol`](keys-composition.md)
## [`Array` filtering](array-filtering.md)
## [`Array` deduplication](array-unique.md)
## [Getting last item from `Array`](array-find-from-last.md)
## [`Number.range`](number-range.md)
## [`Number.fromString`](number-from-string.md)
## [`Math` extensions](math-extensions.md)
## [`Math.signbit`](math-signbit.md)
## [`String.cooked`](string-cooked.md)
## [`String.prototype.codePoints`](string-code-points.md)
## [`Symbol.matcher` for pattern matching](pattern-matching.md)
## [Seeded pseudo-random numbers](seeded-random.md)

# Stage 0[⬆](#index)
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js(-pure)/stage/0
```
## [`Function.prototype.unThis`](function-un-this.md)
## [`Function.{ isCallable, isConstructor }`](function-is-callable-is-constructor.md)
## [`URL`](url.md)

# Pre-stage 0[⬆](#index)
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js(-pure)/stage/pre
```
## [`Reflect` metadata](reflect-metadata.md)
