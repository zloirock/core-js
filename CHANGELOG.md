# Changelog
### Unreleased
- Minor fix / optimization in the `RegExp` constructor (NCG and `dotAll`) polyfill
- Compat data improvements:
  - [`Map` upsert proposal](https://github.com/tc39/proposal-upsert) features marked as [shipped in V8 ~ Chrome 145](https://issues.chromium.org/issues/434977728#comment4)
  - [Joint iteration proposal](https://github.com/tc39/proposal-joint-iteration) features marked as [shipped in FF148](https://bugzilla.mozilla.org/show_bug.cgi?id=2003333#c8)
  - Added [Deno 2.6](https://github.com/denoland/deno/releases/tag/v2.6.0) compat data mapping
  - Added [Opera Android 93](https://forums.opera.com/topic/87267/opera-for-android-93) compat data mapping

### [3.47.0 - 2025.11.18](https://github.com/zloirock/core-js/releases/tag/v3.47.0)
- Changes [v3.46.0...v3.47.0](https://github.com/zloirock/core-js/compare/v3.46.0...v3.47.0) (117 commits)
- [`JSON.parse` source text access proposal](https://github.com/tc39/proposal-json-parse-with-source) :
  - Built-ins:
    - `JSON.isRawJSON`
    - `JSON.parse`
    - `JSON.rawJSON`
    - `JSON.stringify`
  - Moved to stable ES, [November 2025 TC39 meeting](https://x.com/robpalmer2/status/1990603365236289653)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
  - Reworked `JSON.stringify` internals
- [`Iterator` sequencing proposal](https://github.com/tc39/proposal-iterator-sequencing):
  - Built-ins:
    - `Iterator.concat`
  - Moved to stable ES, [November 2025 TC39 meeting](https://github.com/tc39/proposals/commit/33be3cb6d6743c7cc8628c547423f49078c0b655)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
- [Joint iteration proposal](https://github.com/tc39/proposal-joint-iteration):
  - Built-ins:
    - `Iterator.zip`
    - `Iterator.zipKeyed`
  - Moved to stage 3, [November 2025 TC39 meeting](https://github.com/tc39/proposals/commit/6c0126b8f44323254c93045ee7ec216e49b83ddd)
  - Added `/actual/` namespace entries, unconditional forced replacement changed to feature detection
- Fixed increasing `.size` in `URLSearchParams.prototype.append` polyfill in IE8-
- Compat data improvements:
  - [`Iterator.concat`](https://github.com/tc39/proposal-iterator-sequencing) marked as [shipped in FF147](https://bugzilla.mozilla.org/show_bug.cgi?id=1986672#c4)
  - [`Map` upsert proposal](https://github.com/tc39/proposal-upsert) features marked as shipped in Safari 26.2
  - `Math.sumPrecise` marked as shipped in Safari 26.2
  - `Uint8Array.{ fromBase64, prototype.setFromBase64 }` marked as fixed in Safari 26.2
  - Missed [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) features [added in Bun 1.3.0](https://bun.com/blog/bun-v1.3#disposablestack-and-asyncdisposablestack)
  - Added Oculus Quest Browser 41 compat data mapping
  - Added Electron 40 compat data mapping

### [3.46.0 - 2025.10.09](https://github.com/zloirock/core-js/releases/tag/v3.46.0)
- Changes [v3.45.1...v3.46.0](https://github.com/zloirock/core-js/compare/v3.45.1...v3.46.0) (116 commits)
- [`Map` upsert stage 3 proposal](https://github.com/tc39/proposal-upsert):
  - Fixed [a FF `WeakMap.prototype.getOrInsertComputed` bug with callback calling before validation a key](https://bugzilla.mozilla.org/show_bug.cgi?id=1988369)
- [`Iterator` chunking proposal](https://github.com/tc39/proposal-iterator-chunking):
  - Built-ins:
    - `Iterator.prototype.chunks`
    - `Iterator.prototype.windows`
  - Moved to stage 2.7, [September 2025 TC39 meeting](https://github.com/tc39/proposals/commit/08e583103c6c244c05a26d9fee518ef8145ba2f6)
  - `Iterator.prototype.sliding` method replaced with an extra parameter of `Iterator.prototype.windows` method, [tc39/proposal-iterator-chunking/#24](https://github.com/tc39/proposal-iterator-chunking/pull/24), [tc39/proposal-iterator-chunking/#26](https://github.com/tc39/proposal-iterator-chunking/pull/26)
- Fixed [`Iterator.zip` and `Iterator.zipKeyed`](https://github.com/tc39/proposal-joint-iteration) behavior with `mode: 'longest'` option, [#1469](https://github.com/zloirock/core-js/issues/1469), thanks [**@lionel-rowe**](https://github.com/lionel-rowe)
- Fixed work of `Object.groupBy` and [`Iterator.zipKeyed`](https://github.com/tc39/proposal-joint-iteration) together with `Symbol` polyfill - some cases of symbol keys on result `null`-prototype object were able to leak out to `for-in`
- Compat data improvements:
  - [`Map` upsert proposal](https://github.com/tc39/proposal-upsert) features marked as shipped from FF144
  - Added [Node 25.0](https://github.com/nodejs/node/pull/59896) compat data mapping
  - Added [Deno 2.5](https://github.com/denoland/deno/releases/tag/v2.5.0) compat data mapping
  - Updated Electron 39 compat data mapping
  - Updated Opera 121+ compat data mapping
  - Added [Opera Android 92](https://forums.opera.com/topic/86530/opera-for-android-92) compat data mapping
  - Added Oculus Quest Browser 40 compat data mapping

### [3.45.1 - 2025.08.20](https://github.com/zloirock/core-js/releases/tag/v3.45.1)
- Changes [v3.45.0...v3.45.1](https://github.com/zloirock/core-js/compare/v3.45.0...v3.45.1) (30 commits)
- Fixed a conflict of native methods from [`Map` upsert proposal](https://github.com/tc39/proposal-upsert) with polyfilled methods in the pure version
- Added `bugs` fields to `package.json` of all packages
- Compat data improvements:
  - [`Map` upsert proposal](https://github.com/tc39/proposal-upsert) features marked as shipped from Bun 1.2.20
  - Added Samsung Internet 29 compat data mapping
  - Added Electron 39 compat data mapping

### [3.45.0 - 2025.08.04](https://github.com/zloirock/core-js/releases/tag/v3.45.0)
- Changes [v3.44.0...v3.45.0](https://github.com/zloirock/core-js/compare/v3.44.0...v3.45.0) (70 commits)
- [`Uint8Array` to / from base64 and hex proposal](https://github.com/tc39/proposal-arraybuffer-base64):
  - Built-ins:
    - `Uint8Array.fromBase64`
    - `Uint8Array.fromHex`
    - `Uint8Array.prototype.setFromBase64`
    - `Uint8Array.prototype.setFromHex`
    - `Uint8Array.prototype.toBase64`
    - `Uint8Array.prototype.toHex`
  - Moved to stable ES, [July 2025 TC39 meeting](https://github.com/tc39/proposals/commit/d41fe182cdb90da3076ab711aae3944ed86bcf18)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
  - Added detection of a Webkit bug: `Uint8Array` fromBase64 / setFromBase64 does not throw an error on incorrect length of base64 string
- [`Math.sumPrecise` proposal](https://github.com/tc39/proposal-math-sum):
  - Built-ins:
    - `Math.sumPrecise`
  - Moved to stable ES, [July 2025 TC39 meeting](https://github.com/tc39/proposals/commit/2616413ace9074bfd444adee9501fae4c8d66fcb)
  - Added `es.` namespace module, `/es/` and `/stable/` namespaces entries
- [`Iterator` sequencing proposal](https://github.com/tc39/proposal-iterator-sequencing):
  - Built-ins:
    - `Iterator.concat`
  - Moved to stage 3, [July 2025 TC39 meeting](https://github.com/tc39/proposals/commit/3eebab0f8594673dd08bc709d68c011016074c2e)
  - Added `/actual/` namespace entries, unconditional forced replacement changed to feature detection
- [`Map` upsert proposal](https://github.com/tc39/proposal-upsert):
  - Built-ins:
    - `Map.prototype.getOrInsert`
    - `Map.prototype.getOrInsertComputed`
    - `WeakMap.prototype.getOrInsert`
    - `WeakMap.prototype.getOrInsertComputed`
  - Moved to stage 3, [July 2025 TC39 meeting](https://github.com/tc39/proposals/commit/a9c0dfa4e00ffb69aa4df91d8c0c26b064d67108)
  - Added `/actual/` namespace entries, unconditional forced replacement changed to feature detection
- Added missing dependencies to some entries of static `Iterator` methods
- Fixed [Joint Iteration proposal](https://github.com/tc39/proposal-joint-iteration) in `/stage/` entries
- Compat data improvements:
  - [`Uint8Array` to / from base64 and hex proposal](https://github.com/tc39/proposal-arraybuffer-base64) features marked as [supported from V8 ~ Chromium 140](https://issues.chromium.org/issues/42204568#comment37)
  - [`Uint8Array.{ fromBase64, prototype.setFromBase64 }`](https://github.com/tc39/proposal-arraybuffer-base64) marked as unsupported in Safari and supported only from Bun 1.2.20 because of a bug: it does not throw an error on incorrect length of base64 string
  - `%TypedArray%.prototype.with` marked as fixed in Safari 26.0
  - Updated Electron 38 compat data mapping
  - Added [Opera Android 91](https://forums.opera.com/topic/86005/opera-for-android-91) compat data mapping

### [3.44.0 - 2025.07.07](https://github.com/zloirock/core-js/releases/tag/v3.44.0)
- Changes [v3.43.0...v3.44.0](https://github.com/zloirock/core-js/compare/v3.43.0...v3.44.0) (87 commits)
- [`Uint8Array` to / from base64 and hex stage 3 proposal](https://github.com/tc39/proposal-arraybuffer-base64):
  - Fixed [several V8 bugs](https://github.com/zloirock/core-js/issues/1439) in `Uint8Array.fromHex` and `Uint8Array.prototype.{ setFromBase64, toBase64, toHex }`, thanks [**@brc-dd**](https://github.com/brc-dd)
- [Joint iteration stage 2.7 proposal](https://github.com/tc39/proposal-joint-iteration):
  - Uses `Get` in `Iterator.zipKeyed`, following [tc39/proposal-joint-iteration#43](https://github.com/tc39/proposal-joint-iteration/pull/43)
- [`Iterator` sequencing stage 2.7 proposal](https://github.com/tc39/proposal-iterator-sequencing):
  - `Iterator.concat` no longer reuses `IteratorResult` object of concatenated iterators, following [tc39/proposal-iterator-sequencing#26](https://github.com/tc39/proposal-iterator-sequencing/pull/26)
- [`Iterator` chunking stage 2 proposal](https://github.com/tc39/proposal-iterator-chunking):
  - Added built-ins:
    - `Iterator.prototype.sliding`
- [`Number.prototype.clamp` stage 2 proposal](https://github.com/tc39/proposal-math-clamp):
  - `clamp` no longer throws an error on `NaN` as `min` or `max`, following [tc39/proposal-math-clamp#d2387791c265edf66fbe2455eab919016717ce6f](https://github.com/tc39/proposal-math-clamp/commit/d2387791c265edf66fbe2455eab919016717ce6f) 
- Fixed some cases of `Set.prototype.{ symmetricDifference, union }` detection
- Added missing dependencies to some entries of static `Iterator` methods
- Added missing `/full/{ instance, number/virtual }/clamp` entries
- Some minor stylistic changes
- Compat data improvements:
  - Added Electron 38 and 39 compat data mapping
  - Added Oculus Quest Browser 38 and 39 compat data mapping
  - `Iterator` helpers marked as fixed and updated following the latest spec changes in Safari 26.0
  - `Set.prototype.{ difference, symmetricDifference, union }` marked as fixed in Safari 26.0
  - `SuppressedError` marked [as fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1971000) in FF141
  - `Error.isError` marked [as fixed](https://github.com/nodejs/node/pull/58691) in Node 24.3
  - `setImmediate` and `clearImmediate` marked as available [from Deno 2.4](https://github.com/denoland/deno/pull/29877)
  - `Math.sumPrecise` marked as [shipped in Bun 1.2.18](https://github.com/oven-sh/bun/pull/20569)
  - `%TypedArray%.prototype.with` marked as fixed in Bun 1.2.18

### [3.43.0 - 2025.06.09](https://github.com/zloirock/core-js/releases/tag/v3.43.0)
- Changes [v3.42.0...v3.43.0](https://github.com/zloirock/core-js/compare/v3.42.0...v3.43.0) (139 commits)
- [Explicit Resource Management proposals](https://github.com/tc39/proposal-explicit-resource-management):
  - Built-ins:
    - `Symbol.dispose`
    - `Symbol.asyncDispose`
    - `SuppressedError`
    - `DisposableStack`
      - `DisposableStack.prototype.dispose`
      - `DisposableStack.prototype.use`
      - `DisposableStack.prototype.adopt`
      - `DisposableStack.prototype.defer`
      - `DisposableStack.prototype.move`
      - `DisposableStack.prototype[@@dispose]`
    - `AsyncDisposableStack`
      - `AsyncDisposableStack.prototype.disposeAsync`
      - `AsyncDisposableStack.prototype.use`
      - `AsyncDisposableStack.prototype.adopt`
      - `AsyncDisposableStack.prototype.defer`
      - `AsyncDisposableStack.prototype.move`
      - `AsyncDisposableStack.prototype[@@asyncDispose]`
    - `Iterator.prototype[@@dispose]`
    - `AsyncIterator.prototype[@@asyncDispose]`
  - Moved to stable ES, [May 2025 TC39 meeting](https://x.com/robpalmer2/status/1927744934343213085)
  - Added `es.` namespace module, `/es/` and `/stable/` namespaces entries
- [`Array.fromAsync` proposal](https://github.com/tc39/proposal-array-from-async):
  - Built-ins:
    - `Array.fromAsync`
  - Moved to stable ES, [May 2025 TC39 meeting](https://github.com/tc39/proposal-array-from-async/issues/14#issuecomment-2916645435)
  - Added `es.` namespace module, `/es/` and `/stable/` namespaces entries
- [`Error.isError` proposal](https://github.com/tc39/proposal-is-error):
  - Built-ins:
    - `Error.isError`
  - Moved to stable ES, [May 2025 TC39 meeting](https://github.com/tc39/proposals/commit/a5d4bb99d79f328533d0c36b0cd20597fa12c7a8)
  - Added `es.` namespace module, `/es/` and `/stable/` namespaces entries
- Added [Joint iteration stage 2.7 proposal](https://github.com/tc39/proposal-joint-iteration):
  - Added built-ins:
    - `Iterator.zip`
    - `Iterator.zipKeyed`
- Added [`Iterator` chunking stage 2 proposal](https://github.com/tc39/proposal-iterator-chunking):
  - Added built-ins:
    - `Iterator.prototype.chunks`
    - `Iterator.prototype.windows`
- [`Number.prototype.clamp` proposal](https://github.com/tc39/proposal-math-clamp):
  - Built-ins:
    - `Number.prototype.clamp`
  - Moved to stage 2, [May 2025 TC39 meeting](https://github.com/tc39/proposal-math-clamp/commit/a005f28a6a03e175b9671de1c8c70dd5b7b08c2d)
  - `Math.clamp` was replaced with `Number.prototype.clamp`
  - Removed a `RangeError` if `min <= max` or `+0` min and `-0` max, [tc39/proposal-math-clamp/#22](https://github.com/tc39/proposal-math-clamp/issues/22)
- Always check regular expression flags by `flags` getter [PR](https://github.com/tc39/ecma262/pull/2791). Native methods are not fixed, only own implementation updated for:
  - `RegExp.prototype[@@match]`
  - `RegExp.prototype[@@replace]`
- Improved handling of `RegExp` flags in polyfills of some methods in engines without proper support of `RegExp.prototype.flags` and without polyfill of this getter
- Added feature detection for [a WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=288595) that occurs when `this` is updated while `Set.prototype.difference` is being executed
- Added feature detection for [a WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=289430) that occurs when iterator record of a set-like object isn't called before cloning `this` in the following methods:
  - `Set.prototype.symmetricDifference`
  - `Set.prototype.union`
- Added feature detection for [a bug](https://issues.chromium.org/issues/336839115) in V8 ~ Chromium < 126. Following methods should throw an error on invalid iterator:
  - `Iterator.prototype.drop`
  - `Iterator.prototype.filter`
  - `Iterator.prototype.flatMap`
  - `Iterator.prototype.map`
- Added feature detection for [a WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=288714): incorrect exception thrown by `Iterator.from` when underlying iterator's `return` method is `null`
- Added feature detection for a FF bug: incorrect exception thrown by `Array.prototype.with` when index coercion fails
- Added feature detection for a WebKit bug: `TypedArray.prototype.with` should truncate negative fractional index to zero, but instead throws an error
- Worked around a bug of many different tools ([example](https://github.com/zloirock/core-js/pull/1368#issuecomment-2908034690)) with incorrect transforming and breaking JS syntax on getting a method from a number literal
- Fixed deoptimization of the `Promise` polyfill in the pure version
- Added some missed dependencies to `/iterator/flat-map` entries
- Some other minor fixes and improvements
- Compat data improvements:
  - Added [Deno 2.3](https://github.com/denoland/deno/releases/tag/v2.3.0) and [Deno 2.3.2](https://github.com/denoland/deno/releases/tag/v2.3.2) compat data mapping
  - Updated Electron 37 compat data mapping
  - Added Opera Android 90 compat data mapping
  - [`Error.isError`](https://github.com/tc39/proposal-is-error) marked not supported in Node because of [a bug](https://github.com/nodejs/node/issues/56497)
  - `Set.prototype.difference` marked as not supported in Safari and supported only from Bun 1.2.5 because of [a bug](https://bugs.webkit.org/show_bug.cgi?id=288595)
  - `Set.prototype.{ symmetricDifference, union }` marked as not supported in Safari and supported only from Bun 1.2.5 because of [a bug](https://bugs.webkit.org/show_bug.cgi?id=289430)
  - `Iterator.from` marked as not supported in Safari and supported only from Bun 1.2.5 because of [a bug](https://bugs.webkit.org/show_bug.cgi?id=288714)
  - Iterators closing on early errors in `Iterator` helpers marked as implemented from FF141
  - `Array.prototype.with` marked as supported only from FF140 because it throws an incorrect exception when index coercion fails
  - `TypedArray.prototype.with` marked as unsupported in Bun and Safari because it should truncate negative fractional index to zero, but instead throws an error
  - `DisposableStack` and `AsyncDisposableStack` marked as [shipped in FF141](https://bugzilla.mozilla.org/show_bug.cgi?id=1967744) (`SuppressedError` has [a bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1971000))
  - `AsyncDisposableStack` bugs marked as fixed in Deno 2.3.2
  - `SuppressedError` bugs ([extra arguments support](https://github.com/oven-sh/bun/issues/9283) and [arity](https://github.com/oven-sh/bun/issues/9282)) marked as fixed in Bun 1.2.15

### [3.42.0 - 2025.04.30](https://github.com/zloirock/core-js/releases/tag/v3.42.0)
- Changes [v3.41.0...v3.42.0](https://github.com/zloirock/core-js/compare/v3.41.0...v3.42.0) (142 commits)
- [`Map` upsert proposal](https://github.com/tc39/proposal-upsert):
  - Moved to stage 2.7, [April 2025 TC39 meeting](https://x.com/robpalmer2/status/1911882240109261148)
  - Validation order of `WeakMap.prototype.getOrInsertComputed` updated following [tc39/proposal-upsert#79](https://github.com/tc39/proposal-upsert/pull/79)
  - Built-ins:
    - `Map.prototype.getOrInsert`
    - `Map.prototype.getOrInsertComputed`
    - `WeakMap.prototype.getOrInsert`
    - `WeakMap.prototype.getOrInsertComputed`
- Don't call well-known `Symbol` methods for `RegExp` on primitive values following [tc39/ecma262#3009](https://github.com/tc39/ecma262/pull/3009):
  - For avoid performance regression, temporarily, only in own `core-js` implementations
  - Built-ins:
    - `String.prototype.matchAll`
    - `String.prototype.match`
    - `String.prototype.replaceAll`
    - `String.prototype.replace`
    - `String.prototype.search`
    - `String.prototype.split`
- Added workaround for the [`Uint8Array.prototype.setFromBase64`](https://github.com/tc39/proposal-arraybuffer-base64) [bug](https://bugs.webkit.org/show_bug.cgi?id=290829) in some of Linux builds of WebKit
- Implemented early-error iterator closing following [tc39/ecma262#3467](https://github.com/tc39/ecma262/pull/3467), including fix of [a WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=291195), in the following methods:
  - `Iterator.prototype.drop`
  - `Iterator.prototype.every`
  - `Iterator.prototype.filter`
  - `Iterator.prototype.find`
  - `Iterator.prototype.flatMap`
  - `Iterator.prototype.forEach`
  - `Iterator.prototype.map`
  - `Iterator.prototype.reduce`
  - `Iterator.prototype.some`
  - `Iterator.prototype.take`
- Fixed missing forced replacement of [`AsyncIterator` helpers](https://github.com/tc39/proposal-async-iterator-helpers)
- Added closing of sync iterator when async wrapper yields a rejection following [tc39/ecma262#2600](https://github.com/tc39/ecma262/pull/2600). Affected methods:
  - [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async) (due to the lack of async feature detection capability - temporarily, only in own `core-js` implementation)
  - [`AsyncIterator.from`](https://github.com/tc39/proposal-async-iterator-helpers)
  - [`Iterator.prototype.toAsync`](https://github.com/tc39/proposal-async-iterator-helpers)
- Added detection for throwing on `undefined` initial parameter in `Iterator.prototype.reduce` (see [WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=291651))
- `core-js-compat` and `core-js-builder` API:
  - Added `'intersect'` support for `targets.esmodules` (Babel 7 behavior)
  - Fixed handling of `targets.esmodules: true` (Babel 7 behavior)
- Compat data improvements:
  - [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) features disabled (again) in V8 ~ Chromium 135 and re-added in 136
  - [`RegExp.escape`](https://github.com/tc39/proposal-regex-escaping) marked as [shipped from V8 ~ Chromium 136](https://issues.chromium.org/issues/353856236#comment17)
  - [`Error.isError`](https://github.com/tc39/proposal-is-error) marked as [shipped from FF138](https://bugzilla.mozilla.org/show_bug.cgi?id=1952249)
  - [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) features re-enabled in [Deno 2.2.10](https://github.com/denoland/deno/releases/tag/v2.2.10)
  - [`Iterator` helpers proposal](https://github.com/tc39/proposal-iterator-helpers) features marked as supported from Deno 1.38.1 since it seems they were disabled in 1.38.0
  - `Iterator.prototype.{ drop, reduce, take }` methods marked as fixed in Bun 1.2.11
  - Added [NodeJS 24.0](https://github.com/nodejs/node/pull/57609) compat data mapping
  - Updated Electron 36 and added Electron 37 compat data mapping
  - Added Opera Android [88](https://forums.opera.com/topic/83800/opera-for-android-88) and [89](https://forums.opera.com/topic/84437/opera-for-android-89) compat data mapping
  - Added Oculus Quest Browser 37 compat data mapping

### [3.41.0 - 2025.03.01](https://github.com/zloirock/core-js/releases/tag/v3.41.0)
- Changes [v3.40.0...v3.41.0](https://github.com/zloirock/core-js/compare/v3.40.0...v3.41.0) (85 commits)
- [`RegExp.escape` proposal](https://github.com/tc39/proposal-regex-escaping):
  - Built-ins:
    - `RegExp.escape`
  - Moved to stable ES, [February 2025 TC39 meeting](https://github.com/tc39/proposals/commit/b81fa9bccf4b51f33de0cbe797976a84d05d4b76)
  - Added `es.` namespace module, `/es/` and `/stable/` namespaces entries
- [`Float16` proposal](https://github.com/tc39/proposal-float16array):
  - Built-ins:
    - `Math.f16round`
    - `DataView.prototype.getFloat16`
    - `DataView.prototype.setFloat16`
  - Moved to stable ES, [February 2025 TC39 meeting](https://github.com/tc39/proposals/commit/b81fa9bccf4b51f33de0cbe797976a84d05d4b76)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
- [`Math.clamp` stage 1 proposal](https://github.com/CanadaHonk/proposal-math-clamp):
  - Built-ins:
    - `Math.clamp`
  - Extracted from [old `Math` extensions proposal](https://github.com/rwaldron/proposal-math-extensions), [February 2025 TC39 meeting](https://github.com/tc39/proposals/commit/0c24594aab19a50b86d0db7248cac5eb0ae35621)
  - Added arguments validation
  - Added new entries
- Added a workaround of a V8 `AsyncDisposableStack` bug, [tc39/proposal-explicit-resource-management/256](https://github.com/tc39/proposal-explicit-resource-management/issues/256)
- Compat data improvements:
  - [`DisposableStack`, `SuppressedError` and `Iterator.prototype[@@dispose]`](https://github.com/tc39/proposal-explicit-resource-management) marked as [shipped from V8 ~ Chromium 134](https://issues.chromium.org/issues/42203506#comment24)
  - [`Error.isError`](https://github.com/tc39/proposal-is-error) added and marked as [shipped from V8 ~ Chromium 134](https://issues.chromium.org/issues/382104870#comment4)
  - [`Math.f16round` and `DataView.prototype.{ getFloat16, setFloat16 }`](https://github.com/tc39/proposal-float16array) marked as [shipped from V8 ~ Chromium 135](https://issues.chromium.org/issues/42203953#comment36)
  - [`Iterator` helpers proposal](https://github.com/tc39/proposal-iterator-helpers) features marked as [shipped from Safari 18.4](https://developer.apple.com/documentation/safari-release-notes/safari-18_4-release-notes#New-Features)
  - [`JSON.parse` source text access proposal](https://github.com/tc39/proposal-json-parse-with-source) features marked as [shipped from Safari 18.4](https://developer.apple.com/documentation/safari-release-notes/safari-18_4-release-notes#New-Features)
  - [`Math.sumPrecise`](https://github.com/tc39/proposal-math-sum) marked as shipped from FF137
  - Added [Deno 2.2](https://github.com/denoland/deno/releases/tag/v2.2.0) compat data and compat data mapping
    - Explicit Resource Management features are available in V8 ~ Chromium 134, but not in Deno 2.2 based on it
  - Updated Electron 35 and added Electron 36 compat data mapping
  - Updated [Opera Android 87](https://forums.opera.com/topic/75836/opera-for-android-87) compat data mapping
  - Added Samsung Internet 28 compat data mapping
  - Added Oculus Quest Browser 36 compat data mapping

### [3.40.0 - 2025.01.08](https://github.com/zloirock/core-js/releases/tag/v3.40.0)
- Changes [v3.39.0...v3.40.0](https://github.com/zloirock/core-js/compare/v3.39.0...v3.40.0) (130 commits)
- Added [`Error.isError` stage 3 proposal](https://github.com/tc39/proposal-is-error):
  - Added built-ins:
    - `Error.isError`
  - We have no bulletproof way to polyfill this method / check if the object is an error, so it's an enough naive implementation that is marked as `.sham`
- [Explicit Resource Management stage 3 proposal](https://github.com/tc39/proposal-explicit-resource-management):
  - Updated the way async disposing of only sync disposable resources, [tc39/proposal-explicit-resource-management/218](https://github.com/tc39/proposal-explicit-resource-management/pull/218)
- [`Iterator` sequencing stage 2.7 proposal](https://github.com/tc39/proposal-iterator-sequencing):
  - Reuse `IteratorResult` objects when possible, [tc39/proposal-iterator-sequencing/17](https://github.com/tc39/proposal-iterator-sequencing/issues/17), [tc39/proposal-iterator-sequencing/18](https://github.com/tc39/proposal-iterator-sequencing/pull/18), December 2024 TC39 meeting
- Added a fix of [V8 < 12.8](https://issues.chromium.org/issues/351332634) / [NodeJS < 22.10](https://github.com/nodejs/node/pull/54883) bug with handling infinite length of set-like objects in `Set` methods
- Optimized `DataView.prototype.{ getFloat16, setFloat16 }` performance, [#1379](https://github.com/zloirock/core-js/pull/1379), thanks [**@LeviPesin**](https://github.com/LeviPesin)
- Dropped unneeded feature detection of non-standard `%TypedArray%.prototype.toSpliced`
- Dropped possible re-usage of some non-standard / early stage features (like `Math.scale`) available on global
- Some other minor improvements
- Compat data improvements:
  - [`RegExp.escape`](https://github.com/tc39/proposal-regex-escaping) marked as shipped from Safari 18.2
  - [`Promise.try`](https://github.com/tc39/proposal-promise-try) marked as shipped from Safari 18.2
  - [`Math.f16round` and `DataView.prototype.{ getFloat16, setFloat16 }`](https://github.com/tc39/proposal-float16array) marked as shipped from Safari 18.2
  - [`Uint8Array` to / from base64 and hex proposal](https://github.com/tc39/proposal-arraybuffer-base64) methods marked as shipped from Safari 18.2
  - [`JSON.parse` source text access proposal](https://github.com/tc39/proposal-json-parse-with-source) features marked as [shipped from FF135](https://bugzilla.mozilla.org/show_bug.cgi?id=1934622)
  - [`RegExp.escape`](https://github.com/tc39/proposal-regex-escaping) marked as shipped [from FF134](https://bugzilla.mozilla.org/show_bug.cgi?id=1918235)
  - [`Promise.try`](https://github.com/tc39/proposal-promise-try) marked as shipped from FF134
  - [`Symbol.dispose`, `Symbol.asyncDispose` and `Iterator.prototype[@@dispose]`](https://github.com/tc39/proposal-explicit-resource-management) marked as shipped from FF135
  - [`JSON.parse` source text access proposal](https://github.com/tc39/proposal-json-parse-with-source) features marked as shipped from Bun 1.1.43
  - Fixed NodeJS version where `URL.parse` was added - 22.1 instead of 22.0
  - Added [Deno 2.1](https://github.com/denoland/deno/releases/tag/v2.1.0) compat data mapping
  - Added [Rhino 1.8.0](https://github.com/mozilla/rhino/releases/tag/Rhino1_8_0_Release) compat data with significant number of modern features
  - Added Electron 35 compat data mapping
  - Updated Opera 115+ compat data mapping
  - Added Opera Android [86](https://forums.opera.com/topic/75006/opera-for-android-86) and 87 compat data mapping

### [3.39.0 - 2024.10.31](https://github.com/zloirock/core-js/releases/tag/v3.39.0)
- Changes [v3.38.1...v3.39.0](https://github.com/zloirock/core-js/compare/v3.38.1...v3.39.0)
- [`Iterator` helpers proposal](https://github.com/tc39/proposal-iterator-helpers):
  - Built-ins:
    - `Iterator`
      - `Iterator.from`
      - `Iterator.prototype.drop`
      - `Iterator.prototype.every`
      - `Iterator.prototype.filter`
      - `Iterator.prototype.find`
      - `Iterator.prototype.flatMap`
      - `Iterator.prototype.forEach`
      - `Iterator.prototype.map`
      - `Iterator.prototype.reduce`
      - `Iterator.prototype.some`
      - `Iterator.prototype.take`
      - `Iterator.prototype.toArray`
      - `Iterator.prototype[@@toStringTag]`
  - Moved to stable ES, [October 2024 TC39 meeting](https://github.com/tc39/proposal-iterator-helpers/issues/284#event-14549961807)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
- [`Promise.try`](https://github.com/tc39/proposal-promise-try):
  - Built-ins:
    - `Promise.try`
  - Moved to stable ES, [October 2024 TC39 meeting](https://github.com/tc39/proposal-promise-try/commit/53d3351687274952b3b88f3ad024d9d68a9c1c93)
  - Added `es.` namespace module, `/es/` and `/stable/` namespaces entries
  - Fixed `/actual|full/promise/try` entries for the callback arguments support
- [`Math.sumPrecise` proposal](https://github.com/tc39/proposal-math-sum):
  - Built-ins:
    - `Math.sumPrecise`
  - Moved to stage 3, [October 2024 TC39 meeting](https://github.com/tc39/proposal-math-sum/issues/19)
  - Added `/actual/` namespace entries, unconditional forced replacement changed to feature detection
- Added [`Iterator` sequencing stage 2.7 proposal](https://github.com/tc39/proposal-iterator-sequencing):
  - Added built-ins:
    - `Iterator.concat`
- [`Map` upsert stage 2 proposal](https://github.com/tc39/proposal-upsert):
  - [Updated to the new API following the October 2024 TC39 meeting](https://github.com/tc39/proposal-upsert/pull/58)
  - Added built-ins:
    - `Map.prototype.getOrInsert`
    - `Map.prototype.getOrInsertComputed`
    - `WeakMap.prototype.getOrInsert`
    - `WeakMap.prototype.getOrInsertComputed`
- [Extractors proposal](https://github.com/tc39/proposal-extractors) moved to stage 2, [October 2024 TC39 meeting](https://github.com/tc39/proposals/commit/11bc489049fc5ce59b21e98a670a84f153a29a80)
- Usage of `@@species` pattern removed from `%TypedArray%` and `ArrayBuffer` methods, [tc39/ecma262/3450](https://github.com/tc39/ecma262/pull/3450):
  - Built-ins:
    - `%TypedArray%.prototype.filter`
    - `%TypedArray%.prototype.filterReject`
    - `%TypedArray%.prototype.map`
    - `%TypedArray%.prototype.slice`
    - `%TypedArray%.prototype.subarray`
    - `ArrayBuffer.prototype.slice`
- Some other minor improvements
- Compat data improvements:
  - [`Uint8Array` to / from base64 and hex proposal](https://github.com/tc39/proposal-arraybuffer-base64) methods marked as [shipped from FF133](https://bugzilla.mozilla.org/show_bug.cgi?id=1917885#c9)
  - Added [NodeJS 23.0](https://nodejs.org/en/blog/release/v23.0.0) compat data mapping
  - `self` descriptor [is fixed](https://github.com/denoland/deno/issues/24683) in Deno 1.46.0
  - Added Deno [1.46](https://github.com/denoland/deno/releases/tag/v1.46.0) and [2.0](https://github.com/denoland/deno/releases/tag/v2.0.0) compat data mapping
  - [`Iterator` helpers proposal](https://github.com/tc39/proposal-iterator-helpers) methods marked as [shipped from Bun 1.1.31](https://github.com/oven-sh/bun/pull/14455)
  - Added Electron 34 and updated Electron 33 compat data mapping
  - Added [Opera Android 85](https://forums.opera.com/topic/74256/opera-for-android-85) compat data mapping
  - Added Oculus Quest Browser 35 compat data mapping

### [3.38.1 - 2024.08.20](https://github.com/zloirock/core-js/releases/tag/v3.38.1)
- Changes [v3.38.0...v3.38.1](https://github.com/zloirock/core-js/compare/v3.38.0...v3.38.1)
- Fixed some cases of `URLSearchParams` percent decoding, [#1357](https://github.com/zloirock/core-js/issues/1357), [#1361](https://github.com/zloirock/core-js/pull/1361), thanks [**@slowcheetah**](https://github.com/slowcheetah)
- Some stylistic changes and minor optimizations
- Compat data improvements:
  - [`Iterator` helpers proposal](https://github.com/tc39/proposal-iterator-helpers) methods marked as [shipped from FF131](https://bugzilla.mozilla.org/show_bug.cgi?id=1896390)
  - [`Math.f16round` and `DataView.prototype.{ getFloat16, setFloat16 }`](https://github.com/tc39/proposal-float16array) marked as shipped from Bun 1.1.23
  - [`RegExp.escape`](https://github.com/tc39/proposal-regex-escaping) marked as shipped from Bun 1.1.22
  - [`Promise.try`](https://github.com/tc39/proposal-promise-try) marked as shipped from Bun 1.1.22
  - [`Uint8Array` to / from base64 and hex proposal](https://github.com/tc39/proposal-arraybuffer-base64) methods marked as shipped from Bun 1.1.22
  - Added [Hermes 0.13](https://github.com/facebook/hermes/releases/tag/v0.13.0) compat data, similar to React Native 0.75 Hermes
  - Added [Opera Android 84](https://forums.opera.com/topic/73545/opera-for-android-84) compat data mapping

### [3.38.0 - 2024.08.05](https://github.com/zloirock/core-js/releases/tag/v3.38.0)
- Changes [v3.37.1...v3.38.0](https://github.com/zloirock/core-js/compare/v3.37.1...v3.38.0)
- [`RegExp.escape` proposal](https://github.com/tc39/proposal-regex-escaping):
  - Built-ins:
    - `RegExp.escape`
  - Moved to stage 3, [June 2024](https://github.com/tc39/proposals/commit/4b8ee265248abfa2c88ed71b3c541ddd5a2eaffe) and [July 2024](https://github.com/tc39/proposals/commit/bdb2eea6c5e41a52f2d6047d7de1a31b5d188c4f) TC39 meetings
  - Updated the way of escaping, [regex-escaping/77](https://github.com/tc39/proposal-regex-escaping/pull/77)
  - Throw an error on non-strings, [regex-escaping/58](https://github.com/tc39/proposal-regex-escaping/pull/58)
  - Added `/actual/` namespace entries, unconditional forced replacement changed to feature detection
- [`Promise.try` proposal](https://github.com/tc39/proposal-promise-try):
  - Built-ins:
    - `Promise.try`
  - Moved to stage 3, [June 2024 TC39 meeting](https://github.com/tc39/proposals/commit/de20984cd7f7bc616682c557cb839abc100422cb)
  - Added `/actual/` namespace entries, unconditional forced replacement changed to feature detection
- [`Uint8Array` to / from base64 and hex stage 3 proposal](https://github.com/tc39/proposal-arraybuffer-base64):
  - Built-ins:
    - `Uint8Array.fromBase64`
    - `Uint8Array.fromHex`
    - `Uint8Array.prototype.setFromBase64`
    - `Uint8Array.prototype.setFromHex`
    - `Uint8Array.prototype.toBase64`
    - `Uint8Array.prototype.toHex`
  - Added `Uint8Array.prototype.{ setFromBase64, setFromHex }` methods
  - Added `Uint8Array.fromBase64` and `Uint8Array.prototype.setFromBase64` `lastChunkHandling` option, [proposal-arraybuffer-base64/33](https://github.com/tc39/proposal-arraybuffer-base64/pull/33)
  - Added `Uint8Array.prototype.toBase64` `omitPadding` option, [proposal-arraybuffer-base64/60](https://github.com/tc39/proposal-arraybuffer-base64/pull/60)
  - Added throwing a `TypeError` on arrays backed by detached buffers
  - Unconditional forced replacement changed to feature detection
- Fixed `RegExp` named capture groups polyfill in combination with non-capturing groups, [#1352](https://github.com/zloirock/core-js/pull/1352), thanks [**@Ulop**](https://github.com/Ulop)
- Improved some cases of environment detection
- Uses [`process.getBuiltinModule`](https://nodejs.org/docs/latest/api/process.html#processgetbuiltinmoduleid) for getting built-in NodeJS modules where it's available
- Uses `https` instead of `http` in `URL` constructor feature detection to avoid extra notifications from some overly vigilant security scanners, [#1345](https://github.com/zloirock/core-js/issues/1345)
- Some minor optimizations
- Updated `browserslist` in `core-js-compat` dependencies that fixes an upstream issue with incorrect interpretation of some `browserslist` queries, [#1344](https://github.com/zloirock/core-js/issues/1344), [browserslist/829](https://github.com/browserslist/browserslist/issues/829), [browserslist/836](https://github.com/browserslist/browserslist/pull/836)
- Compat data improvements:
  - Added [Safari 18.0](https://webkit.org/blog/15443/news-from-wwdc24-webkit-in-safari-18-beta/) compat data:
    - Fixed [`Object.groupBy` and `Map.groupBy`](https://github.com/tc39/proposal-array-grouping) to [work for non-objects](https://bugs.webkit.org/show_bug.cgi?id=271524)
    - Fixed [throwing a `RangeError` if `Set` methods are called on an object with negative size property](https://bugs.webkit.org/show_bug.cgi?id=267494)
    - Fixed [`Set.prototype.symmetricDifference` to call `this.has` in each iteration](https://bugs.webkit.org/show_bug.cgi?id=272679)
    - Fixed [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async) to [not call the `Array` constructor twice](https://bugs.webkit.org/show_bug.cgi?id=271703)
    - Added [`URL.parse`](https://url.spec.whatwg.org/#dom-url-parse)
  - [`Math.f16round` and `DataView.prototype.{ getFloat16, setFloat16 }`](https://github.com/tc39/proposal-float16array) marked as [shipped from FF129](https://bugzilla.mozilla.org/show_bug.cgi?id=1903329)
  - [`Symbol.asyncDispose`](https://github.com/tc39/proposal-explicit-resource-management) added and marked as supported from V8 ~ Chromium 127
  - [`Promise.try`](https://github.com/tc39/proposal-promise-try) added and marked as supported [from V8 ~ Chromium 128](https://chromestatus.com/feature/6315704705089536)
  - Added Deno [1.44](https://github.com/denoland/deno/releases/tag/v1.44.0) and [1.45](https://github.com/denoland/deno/releases/tag/v1.45.0) compat data mapping
  - `self` descriptor [is broken in Deno 1.45.3](https://github.com/denoland/deno/issues/24683) (again)
  - Added Electron 32 and 33 compat data mapping
  - Added [Opera Android 83](https://forums.opera.com/topic/72570/opera-for-android-83) compat data mapping
  - Added Samsung Internet 27 compat data mapping
  - Added Oculus Quest Browser 34 compat data mapping

### [3.37.1 - 2024.05.14](https://github.com/zloirock/core-js/releases/tag/v3.37.1)
- Changes [v3.37.0...v3.37.1](https://github.com/zloirock/core-js/compare/v3.37.0...v3.37.1)
- Fixed [`URL.parse`](https://url.spec.whatwg.org/#dom-url-parse) feature detection for some specific cases
- Compat data improvements:
  - [`Set` methods proposal](https://github.com/tc39/proposal-set-methods) added and marked as [supported from FF 127](https://bugzilla.mozilla.org/show_bug.cgi?id=1868423)
  - [`Symbol.dispose`](https://github.com/tc39/proposal-explicit-resource-management) added and marked as supported from V8 ~ Chromium 125
  - [`Math.f16round` and `DataView.prototype.{ getFloat16, setFloat16 }`](https://github.com/tc39/proposal-float16array) added and marked as [supported from Deno 1.43](https://github.com/denoland/deno/pull/23490)
  - [`URL.parse`](https://url.spec.whatwg.org/#dom-url-parse) added and marked as [supported from Chromium 126](https://chromestatus.com/feature/6301071388704768)
  - [`URL.parse`](https://url.spec.whatwg.org/#dom-url-parse) added and marked as [supported from NodeJS 22.0](https://github.com/nodejs/node/pull/52280)
  - [`URL.parse`](https://url.spec.whatwg.org/#dom-url-parse) added and marked as [supported from Deno 1.43](https://github.com/denoland/deno/pull/23318)
  - Added [Rhino 1.7.15](https://github.com/mozilla/rhino/releases/tag/Rhino1_7_15_Release) compat data, many features marked as supported
  - Added [NodeJS 22.0](https://nodejs.org/en/blog/release/v22.0.0) compat data mapping
  - Added [Deno 1.43](https://github.com/denoland/deno/releases/tag/v1.43.0) compat data mapping
  - Added Electron 31 compat data mapping
  - Updated [Opera Android 82](https://forums.opera.com/topic/71513/opera-for-android-82) compat data mapping
  - Added Samsung Internet 26 compat data mapping
  - Added Oculus Quest Browser 33 compat data mapping

### [3.37.0 - 2024.04.17](https://github.com/zloirock/core-js/releases/tag/v3.37.0)
- Changes [v3.36.1...v3.37.0](https://github.com/zloirock/core-js/compare/v3.36.1...v3.37.0)
- [New `Set` methods proposal](https://github.com/tc39/proposal-set-methods):
  - Built-ins:
    - `Set.prototype.intersection`
    - `Set.prototype.union`
    - `Set.prototype.difference`
    - `Set.prototype.symmetricDifference`
    - `Set.prototype.isSubsetOf`
    - `Set.prototype.isSupersetOf`
    - `Set.prototype.isDisjointFrom`
  - Moved to stable ES, [April 2024 TC39 meeting](https://github.com/tc39/proposals/commit/bda5a6bccbaca183e193f9e680889ea5b5462ce4)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
- [Explicit Resource Management stage 3 proposal](https://github.com/tc39/proposal-explicit-resource-management):
  - Some minor updates like [explicit-resource-management/217](https://github.com/tc39/proposal-explicit-resource-management/pull/217)
- Added [`Math.sumPrecise` stage 2.7 proposal](https://github.com/tc39/proposal-math-sum/):
  - Built-ins:
    - `Math.sumPrecise`
- [`Promise.try` proposal](https://github.com/tc39/proposal-promise-try):
  - Built-ins:
    - `Promise.try`
  - Added optional arguments support, [promise-try/16](https://github.com/tc39/proposal-promise-try/pull/16)
  - Moved to stage 2.7, [April 2024 TC39 meeting](https://github.com/tc39/proposals/commit/301fc9c7eef2344d2b443f32a9c24ecd5fbdbec0)
- [`RegExp.escape` stage 2 proposal](https://github.com/tc39/proposal-regex-escaping):
  - Moved to hex-escape semantics, [regex-escaping/67](https://github.com/tc39/proposal-regex-escaping/pull/67)
    - It's not the final change of the way of escaping, waiting for [regex-escaping/77](https://github.com/tc39/proposal-regex-escaping/pull/77) soon
- [Pattern matching stage 1 proposal](https://github.com/tc39/proposal-pattern-matching):
  - Built-ins:
    - `Symbol.customMatcher`
  - Once again, [the used well-known symbol was renamed](https://github.com/tc39/proposal-pattern-matching/pull/295)
  - Added new entries for that
- Added [Extractors stage 1 proposal](https://github.com/tc39/proposal-extractors):
  - Built-ins:
    - `Symbol.customMatcher`
  - Since the `Symbol.customMatcher` well-known symbol from the pattern matching proposal is also used in the exactors proposal, added an entry also for this proposal
- Added [`URL.parse`](https://url.spec.whatwg.org/#dom-url-parse), [url/825](https://github.com/whatwg/url/pull/825)
- Engines bugs fixes:
  - Added a fix of [Safari `{ Object, Map }.groupBy` bug that does not support iterable primitives](https://bugs.webkit.org/show_bug.cgi?id=271524)
  - Added a fix of [Safari bug with double call of constructor in `Array.fromAsync`](https://bugs.webkit.org/show_bug.cgi?id=271703)
- Compat data improvements:
  - [`URL.parse`](https://url.spec.whatwg.org/#dom-url-parse) added and marked as supported [from FF 126](https://bugzilla.mozilla.org/show_bug.cgi?id=1887611)
  - [`URL.parse`](https://url.spec.whatwg.org/#dom-url-parse) added and marked as supported [from Bun 1.1.4](https://github.com/oven-sh/bun/pull/10129)
  - [`URL.canParse`](https://url.spec.whatwg.org/#dom-url-canparse) fixed and marked as supported [from Bun 1.1.0](https://github.com/oven-sh/bun/pull/9710)
  - [New `Set` methods](https://github.com/tc39/proposal-set-methods) fixed in JavaScriptCore and marked as supported from Bun 1.1.1
  - Added Opera Android 82 compat data mapping

### [3.36.1 - 2024.03.19](https://github.com/zloirock/core-js/releases/tag/v3.36.1)
- Changes [v3.36.0...v3.36.1](https://github.com/zloirock/core-js/compare/v3.36.0...v3.36.1)
- Fixed some validation cases in `Object.setPrototypeOf`, [#1329](https://github.com/zloirock/core-js/issues/1329), thanks [**@minseok-choe**](https://github.com/minseok-choe)
- Fixed the order of validations in `Array.from`, [#1331](https://github.com/zloirock/core-js/pull/1331), thanks [**@minseok-choe**](https://github.com/minseok-choe)
- Added a fix of [Bun `queueMicrotask` arity](https://github.com/oven-sh/bun/issues/9249)
- Added a fix of [Bun `URL.canParse` arity](https://github.com/oven-sh/bun/issues/9250)
- Added a fix of Bun `SuppressedError` [extra arguments support](https://github.com/oven-sh/bun/issues/9283) and [arity](https://github.com/oven-sh/bun/issues/9282)
- Compat data improvements:
  - [`value` argument of `URLSearchParams.prototype.{ has, delete }`](https://url.spec.whatwg.org/#dom-urlsearchparams-delete) marked as supported [from Bun 1.0.31](https://github.com/oven-sh/bun/issues/9263)
  - Added React Native 0.74 Hermes compat data, `Array.prototype.{ toSpliced, toReversed, with }` and `atob` marked as supported
  - Added Deno 1.41.3 compat data mapping
  - Added Opera Android 81 compat data mapping
  - Added Samsung Internet 25 compat data mapping
  - Added Oculus Quest Browser 32 compat data mapping
  - Updated Electron 30 compat data mapping

### [3.36.0 - 2024.02.14](https://github.com/zloirock/core-js/releases/tag/v3.36.0)
- [`ArrayBuffer.prototype.transfer` and friends proposal](https://github.com/tc39/proposal-arraybuffer-transfer):
  - Built-ins:
    - `ArrayBuffer.prototype.detached`
    - `ArrayBuffer.prototype.transfer`
    - `ArrayBuffer.prototype.transferToFixedLength`
  - Moved to stable ES, [Febrary 2024 TC39 meeting](https://github.com/tc39/proposals/commit/c84d3dde9a7d8ee4410ffa28624fc4c39247faca)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
- [`Uint8Array` to / from base64 and hex proposal](https://github.com/tc39/proposal-arraybuffer-base64):
  - Methods:
    - `Uint8Array.fromBase64`
    - `Uint8Array.fromHex`
    - `Uint8Array.prototype.toBase64`
    - `Uint8Array.prototype.toHex`
  - Moved to stage 3, [Febrary 2024 TC39 meeting](https://github.com/tc39/proposals/commit/278ab28b8f849f2110d770e7b034b7ef59f14daf)
  - Added `/actual/` namespace entries
  - Skipped adding new methods of writing to existing arrays to clarification some moments
- [`Promise.try` proposal](https://github.com/tc39/proposal-promise-try) has been resurrected and moved to stage 2, [Febrary 2024 TC39 meeting](https://github.com/tc39/proposal-promise-try/issues/15)
- Added an entry point for [the new TC39 proposals stage](https://tc39.es/process-document/) - `core-js/stage/2.7` - still empty
- Fixed regression in `Set.prototype.intersection` feature detection
- Fixed a missed check in `Array.prototype.{ indexOf, lastIndexOf, includes }`, [#1325](https://github.com/zloirock/core-js/issues/1325), thanks [**@minseok-choe**](https://github.com/minseok-choe)
- Fixed a missed check in `Array.prototype.{ reduce, reduceRight }`, [#1327](https://github.com/zloirock/core-js/issues/1327), thanks [**@minseok-choe**](https://github.com/minseok-choe)
- Fixed `Array.from` and some other methods with proxy targets, [#1322](https://github.com/zloirock/core-js/issues/1322), thanks [**@minseok-choe**](https://github.com/minseok-choe)
- Fixed dependencies loading for modules from `ArrayBuffer.prototype.transfer` and friends proposal in some specific cases in IE10-
- Dropped context workaround from collection static methods entries since with current methods semantic it's no longer required
- Added instance methods polyfills to entries of collections static methods that produce collection instances
- Added missed `Date.prototype.toJSON` to `JSON.stringify` entries dependencies
- Added debugging info in some missed cases
- Compat data improvements:
  - [`{ Map, Object }.groupBy`](https://github.com/tc39/proposal-array-grouping), [`Promise.withResolvers`](https://github.com/tc39/proposal-promise-with-resolvers), [`ArrayBuffer.prototype.transfer` and friends](https://github.com/tc39/proposal-arraybuffer-transfer) marked as supported from [Safari 17.4](https://developer.apple.com/documentation/safari-release-notes/safari-17_4-release-notes#JavaScript)
  - [New `Set` methods](https://github.com/tc39/proposal-set-methods) [fixed](https://bugs.chromium.org/p/v8/issues/detail?id=14559#c4) and marked as supported from V8 ~ Chrome 123
  - Added [Deno 1.40](https://deno.com/blog/v1.40) compat data mapping
  - `Symbol.metadata` marked as supported from [Deno 1.40.4](https://github.com/denoland/deno/releases/tag/v1.40.4)
  - Updated Electron 30 compat data mapping

### [3.35.1 - 2024.01.21](https://github.com/zloirock/core-js/releases/tag/v3.35.1)
- Fixed internal `ToLength` operation with bigints, [#1318](https://github.com/zloirock/core-js/issues/1318)
- Removed significant redundant code from `String.prototype.split` polyfill
- Fixed setting names of methods with symbol keys in some old engines
- Minor fix of prototype methods export logic in the pure version
- Compat data improvements:
  - [`Iterator` helpers proposal](https://github.com/tc39/proposal-iterator-helpers) methods marked as supported from V8 ~ Chrome 122
  - Note that V8 ~ Chrome 122 add [`Set` methods](https://github.com/tc39/proposal-set-methods), but they have [a bug](https://bugs.chromium.org/p/v8/issues/detail?id=14559) [similar to Safari](https://bugs.webkit.org/show_bug.cgi?id=267494)
  - `self` marked as fixed from Bun 1.0.22
  - [`SuppressedError` and `Symbol.{ dispose, asyncDispose }`](https://github.com/tc39/proposal-explicit-resource-management) marked as [supported from Bun 1.0.23](https://bun.sh/blog/bun-v1.0.23#resource-management-is-now-supported)
  - Added Oculus Quest Browser 31 compat data mapping
  - Updated Electron 29 and added Electron 30 compat data mapping

### [3.35.0 - 2023.12.29](https://github.com/zloirock/core-js/releases/tag/v3.35.0)
- [`{ Map, Set, WeakMap, WeakSet }.{ from, of }`](https://github.com/tc39/proposal-setmap-offrom) became non-generic, following [this](https://github.com/tc39/proposal-setmap-offrom/issues/16#issuecomment-1843346541) and some other notes. Now they can be invoked without `this`, but no longer return subclass instances
- Fixed handling some cases of non-enumerable symbol keys from `Symbol` polyfill
- Removed unneeded NodeJS domains-related logic from `queueMicrotask` polyfill
- Fixed subclassing of wrapped `ArrayBuffer`
- Refactoring, many different minor optimizations
- Compat data improvements:
  - [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async) marked as [supported from V8 ~ Chrome 121](https://bugs.chromium.org/p/v8/issues/detail?id=13321#c13)
  - It seems that the ancient [`Array.prototype.push` bug](https://bugs.chromium.org/p/v8/issues/detail?id=12681) is fixed in V8 ~ Chrome 122 (Hallelujah!)
  - [`ArrayBuffer.prototype.transfer` and friends proposal](https://github.com/tc39/proposal-arraybuffer-transfer) features marked as [supported from FF 122](https://bugzilla.mozilla.org/show_bug.cgi?id=1865103#c8) and Bun 1.0.19
  - [`Object.groupBy` and `Map.groupBy`](https://github.com/tc39/proposal-array-grouping) marked as supported from Bun 1.0.19
  - Since [`Iterator` helpers proposal](https://github.com/tc39/proposal-iterator-helpers) methods are still not disabled in Deno, the web compatibility issue why it was disabled in Chromium makes no sense for Deno and fixed in the spec, they marked as supported from Deno 1.37
  - Added Opera Android 80 and updated [Opera Android 79](https://forums.opera.com/topic/68490/opera-for-android-79) compat data mapping
  - Added Samsung Internet 24 compat data mapping

### [3.34.0 - 2023.12.06](https://github.com/zloirock/core-js/releases/tag/v3.34.0)
- [`Array` grouping proposal](https://github.com/tc39/proposal-array-grouping):
  - Methods:
    - `Object.groupBy`
    - `Map.groupBy`
  - Moved to stable ES, [November 2023 TC39 meeting](https://github.com/tc39/proposal-array-grouping/issues/60)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
- [`Promise.withResolvers` proposal](https://github.com/tc39/proposal-promise-with-resolvers):
  - Method:
    - `Promise.withResolvers`
  - Moved to stable ES, [November 2023 TC39 meeting](https://twitter.com/robpalmer2/status/1729216597623976407)
  - Added `es.` namespace module, `/es/` and `/stable/` namespaces entries
- Fixed a web incompatibility issue of [`Iterator` helpers proposal](https://github.com/tc39/proposal-iterator-helpers), [proposal-iterator-helpers/287](https://github.com/tc39/proposal-iterator-helpers/pull/287) and some following changes, November 2023 TC39 meeting
- Added [`Uint8Array` to / from base64 and hex stage 2 proposal](https://github.com/tc39/proposal-arraybuffer-base64):
  - Methods:
    - `Uint8Array.fromBase64`
    - `Uint8Array.fromHex`
    - `Uint8Array.prototype.toBase64`
    - `Uint8Array.prototype.toHex`
- Relaxed some specific cases of [`Number.fromString`](https://github.com/tc39/proposal-number-fromstring) validation before clarification of [proposal-number-fromstring/24](https://github.com/tc39/proposal-number-fromstring/issues/24)
- Fixed `@@toStringTag` property descriptors on DOM collections, [#1312](https://github.com/zloirock/core-js/issues/1312)
- Fixed the order of arguments validation in `Array` iteration methods, [#1313](https://github.com/zloirock/core-js/issues/1313)
- Some minor `atob` / `btoa` improvements
- Compat data improvements:
  - [`Promise.withResolvers`](https://github.com/tc39/proposal-promise-with-resolvers) marked as shipped from FF121

### [3.33.3 - 2023.11.20](https://github.com/zloirock/core-js/releases/tag/v3.33.3)
- Fixed an issue getting the global object on Duktape, [#1303](https://github.com/zloirock/core-js/issues/1303)
- Avoid sharing internal `[[DedentMap]]` from [`String.dedent` proposal](https://github.com/tc39/proposal-string-dedent) between `core-js` instances before stabilization of the proposal
- Some internal untangling
- Compat data improvements:
  - Added [Deno 1.38](https://deno.com/blog/v1.38) compat data mapping
  - [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async) marked as [supported from Deno 1.38](https://github.com/denoland/deno/pull/21048)
  - [`Symbol.{ dispose, asyncDispose }`](https://github.com/tc39/proposal-explicit-resource-management) marked as [supported from Deno 1.38](https://github.com/denoland/deno/pull/20845)
  - Added Opera Android 79 compat data mapping
  - Added Oculus Quest Browser 30 compat data mapping
  - Updated Electron 28 and 29 compat data mapping

### [3.33.2 - 2023.10.31](https://github.com/zloirock/core-js/releases/tag/v3.33.2)
- Simplified `structuredClone` polyfill, avoided second tree pass in cases of transferring
- Added support of [`SuppressedError`](https://github.com/tc39/proposal-explicit-resource-management#the-suppressederror-error) to `structuredClone` polyfill
- Removed unspecified unnecessary `ArrayBuffer` and `DataView` dependencies of `structuredClone` lack of which could cause errors in some entries in IE10-
- Fixed handling of fractional number part in [`Number.fromString`](https://github.com/tc39/proposal-number-fromstring)
- Compat data improvements:
  - [`URL.canParse`](https://url.spec.whatwg.org/#dom-url-canparse) marked as [supported from Chromium 120](https://bugs.chromium.org/p/chromium/issues/detail?id=1425839)
  - Updated Opera Android 78 compat data mapping
  - Added Electron 29 compat data mapping

### [3.33.1 - 2023.10.20](https://github.com/zloirock/core-js/releases/tag/v3.33.1)
- Added one more workaround of possible error with `Symbol` polyfill on global object, [#1289](https://github.com/zloirock/core-js/issues/1289#issuecomment-1768411444)
- Directly specified `type: commonjs` in `package.json` of all packages to avoid potential breakage in future Node versions, see [this issue](https://github.com/nodejs/TSC/issues/1445)
- Prevented potential issue with lack of some dependencies after automatic optimization polyfills of some methods in the pure version
- Some minor internal fixes and optimizations
- Compat data improvements:
  - [`String.prototype.{ isWellFormed, toWellFormed }`](https://github.com/tc39/proposal-is-usv-string) marked as [supported from FF119](https://bugzilla.mozilla.org/show_bug.cgi?id=1850755)
  - Added React Native 0.73 Hermes compat data, mainly fixes of [some issues](https://github.com/facebook/hermes/issues/770)
  - Added [NodeJS 21.0 compat data mapping](https://nodejs.org/ru/blog/release/v21.0.0)

### [3.33.0 - 2023.10.02](https://github.com/zloirock/core-js/releases/tag/v3.33.0)
- Re-introduced [`RegExp` escaping stage 2 proposal](https://github.com/tc39/proposal-regex-escaping), September 2023 TC39 meeting:
  - Added `RegExp.escape` method with the new set of symbols for escaping
  - Some years ago, it was presented in `core-js`, but it was removed after rejecting the old version of this proposal
- Added [`ArrayBuffer.prototype.{ transfer, transferToFixedLength }`](https://github.com/tc39/proposal-arraybuffer-transfer) and support transferring of `ArrayBuffer`s via [`structuredClone`](https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone) to engines with `MessageChannel`
- Optimized [`Math.f16round`](https://github.com/tc39/proposal-float16array) polyfill
- Fixed [some conversion cases](https://github.com/petamoriken/float16/issues/1046) of [`Math.f16round` and `DataView.prototype.{ getFloat16, setFloat16 }`](https://github.com/tc39/proposal-float16array)
- Fully forced polyfilling of [the TC39 `Observable` proposal](https://github.com/tc39/proposal-observable) because of incompatibility with [the new WHATWG `Observable` proposal](https://github.com/WICG/observable)
- Added an extra workaround of errors with exotic environment objects in `Symbol` polyfill, [#1289](https://github.com/zloirock/core-js/issues/1289)
- Some minor fixes and stylistic changes
- Compat data improvements:
  - V8 unshipped [`Iterator` helpers](https://github.com/tc39/proposal-iterator-helpers) because of [some Web compatibility issues](https://github.com/tc39/proposal-iterator-helpers/issues/286)
  - [`Promise.withResolvers`](https://github.com/tc39/proposal-promise-with-resolvers) marked as [supported from V8 ~ Chrome 119](https://chromestatus.com/feature/5810984110784512)
  - [`Array` grouping proposal](https://github.com/tc39/proposal-array-grouping) features marked as [supported from FF119](https://bugzilla.mozilla.org/show_bug.cgi?id=1792650#c9)
  - [`value` argument of `URLSearchParams.prototype.{ has, delete }`](https://url.spec.whatwg.org/#dom-urlsearchparams-delete) marked as properly supported from V8 ~ Chrome 118
  - [`URL.canParse`](https://url.spec.whatwg.org/#dom-url-canparse) and [`URLSearchParams.prototype.size`](https://url.spec.whatwg.org/#dom-urlsearchparams-size) marked as [supported from Bun 1.0.2](https://github.com/oven-sh/bun/releases/tag/bun-v1.0.2)
  - Added Deno 1.37 compat data mapping
  - Added Electron 28 compat data mapping
  - Added Opera Android 78 compat data mapping

### [3.32.2 - 2023.09.07](https://github.com/zloirock/core-js/releases/tag/v3.32.2)
- Fixed `structuredClone` feature detection `core-js@3.32.1` bug, [#1288](https://github.com/zloirock/core-js/issues/1288)
- Added a workaround of old WebKit + `eval` bug, [#1287](https://github.com/zloirock/core-js/pull/1287)
- Compat data improvements:
  - Added Samsung Internet 23 compat data mapping
  - Added Quest Browser 29 compat data mapping

### [3.32.1 - 2023.08.19](https://github.com/zloirock/core-js/releases/tag/v3.32.1)
- Fixed some cases of IEEE754 rounding, [#1279](https://github.com/zloirock/core-js/issues/1279), thanks [**@petamoriken**](https://github.com/petamoriken)
- Prevented injection `process` polyfill to `core-js` via some bundlers or `esm.sh`, [#1277](https://github.com/zloirock/core-js/issues/1277)
- Some minor fixes and stylistic changes
- Compat data improvements:
  - [`Promise.withResolvers`](https://github.com/tc39/proposal-promise-with-resolvers) marked as supported [from Bun 0.7.1](https://bun.sh/blog/bun-v0.7.1#bun-ismainthread-and-promise-withresolvers)
  - Added Opera Android 77 compat data mapping
  - Updated Electron 27 compat data mapping

### [3.32.0 - 2023.07.28](https://github.com/zloirock/core-js/releases/tag/v3.32.0)
- [`Array` grouping proposal](https://github.com/tc39/proposal-array-grouping), July 2023 TC39 meeting updates:
  - [Moved back to stage 3](https://github.com/tc39/proposal-array-grouping/issues/54)
  - Added `/actual/` namespaces entries, unconditional forced replacement changed to feature detection
- [`Promise.withResolvers` proposal](https://github.com/tc39/proposal-promise-with-resolvers), July 2023 TC39 meeting updates:
  - [Moved to stage 3](https://github.com/tc39/proposal-promise-with-resolvers/pull/18)
  - Added `/actual/` namespaces entries, unconditional forced replacement changed to feature detection
- [`Set` methods stage 3 proposal](https://github.com/tc39/proposal-set-methods), July 2023 TC39 meeting updates:
  - Throw on negative `Set` sizes, [proposal-set-methods/88](https://github.com/tc39/proposal-set-methods/pull/88)
  - Removed `IsCallable` check in `GetKeysIterator`, [proposal-set-methods/101](https://github.com/tc39/proposal-set-methods/pull/101)
- [Iterator Helpers stage 3 proposal](https://github.com/tc39/proposal-iterator-helpers):
  - Avoid creating observable `String` wrapper objects, July 2023 TC39 meeting update, [proposal-iterator-helpers/281](https://github.com/tc39/proposal-iterator-helpers/pull/281)
  - `Iterator` is not constructible from the active function object (works as an abstract class)
- Async explicit resource management:
  - Moved back into [the initial proposal](https://github.com/tc39/proposal-explicit-resource-management) -> moved to stage 3, [proposal-explicit-resource-management/154](https://github.com/tc39/proposal-explicit-resource-management/pull/154)
  - Added `/actual/` namespace entries, unconditional forced replacement changed to feature detection
  - Ignore return value of `[@@dispose]()` method when hint is `async-dispose`, [proposal-explicit-resource-management/180](https://github.com/tc39/proposal-explicit-resource-management/pull/180)
  - Added ticks for empty resources, [proposal-explicit-resource-management/163](https://github.com/tc39/proposal-explicit-resource-management/pull/163)
- Added some methods from [`Float16Array` stage 3 proposal](https://github.com/tc39/proposal-float16array):
  - There are some reason why I don't want to add `Float16Array` right now, however, make sense to add some methods from this proposal.
  - Methods:
    - `Math.f16round`
    - `DataView.prototype.getFloat16`
    - `DataView.prototype.setFloat16`
- Added [`DataView` get / set `Uint8Clamped` methods stage 1 proposal](https://github.com/tc39/proposal-dataview-get-set-uint8clamped):
  - Methods:
    - `DataView.prototype.getUint8Clamped`
    - `DataView.prototype.setUint8Clamped`
- Used strict mode in some missed cases, [#1269](https://github.com/zloirock/core-js/issues/1269)
- Fixed [a Chromium 117 bug](https://bugs.chromium.org/p/v8/issues/detail?id=14222) in `value` argument of `URLSearchParams.prototype.{ has, delete }`
- Fixed early WebKit ~ Safari 17.0 beta `Set` methods implementation by the actual spec
- Fixed incorrect `Symbol.{ dispose, asyncDispose }` descriptors from [NodeJS 20.4](https://github.com/nodejs/node/issues/48699) / transpilers helpers / userland code
- Fixed forced polyfilling of some iterator helpers that should return wrapped iterator in the pure version
- Fixed and exposed [`AsyncIteratorPrototype` `core-js/configurator` option](https://github.com/zloirock/core-js#asynciterator-helpers), [#1268](https://github.com/zloirock/core-js/issues/1268)
- Compat data improvements:
  - Sync [`Iterator` helpers proposal](https://github.com/tc39/proposal-iterator-helpers) features marked as [supported](https://chromestatus.com/feature/5102502917177344) from V8 ~ Chrome 117
  - [`Array` grouping proposal](https://github.com/tc39/proposal-array-grouping) features marked as [supported](https://chromestatus.com/feature/5714791975878656) from V8 ~ Chrome 117
  - Mark `Symbol.{ dispose, asyncDispose }` as supported from NodeJS 20.5.0 (as mentioned above, NodeJS 20.4.0 add it, but [with incorrect descriptors](https://github.com/nodejs/node/issues/48699))
  - Added Electron 27 compat data mapping

### [3.31.1 - 2023.07.06](https://github.com/zloirock/core-js/releases/tag/v3.31.1)
- Fixed a `structuredClone` bug with cloning views of transferred buffers, [#1265](https://github.com/zloirock/core-js/issues/1265)
- Fixed the order of arguments validation in `DataView` methods
- Allowed cloning of [`Float16Array`](https://github.com/tc39/proposal-float16array) in `structuredClone`
- Compat data improvements:
  - [`Set` methods proposal](https://github.com/tc39/proposal-set-methods) marked as [supported from Safari 17.0](https://developer.apple.com/documentation/safari-release-notes/safari-17-release-notes#JavaScript)
  - New `URL` features: [`URL.canParse`](https://url.spec.whatwg.org/#dom-url-canparse), [`URLSearchParams.prototype.size`](https://url.spec.whatwg.org/#dom-urlsearchparams-size) and [`value` argument of `URLSearchParams.prototype.{ has, delete }`](https://url.spec.whatwg.org/#dom-urlsearchparams-delete) marked as [supported from Safari 17.0](https://developer.apple.com/documentation/safari-release-notes/safari-17-release-notes#Web-API)
  - `value` argument of `URLSearchParams.prototype.{ has, delete }` marked as supported from [Deno 1.35](https://github.com/denoland/deno/pull/19654)
  - `AggregateError` and well-formed `JSON.stringify` marked as [supported React Native 0.72 Hermes](https://reactnative.dev/blog/2023/06/21/0.72-metro-package-exports-symlinks#more-ecmascript-support-in-hermes)
  - Added Deno 1.35 compat data mapping
  - Added Quest Browser 28 compat data mapping
  - Added missing NodeJS 12.16-12.22 compat data mapping
  - Updated Opera Android 76 compat data mapping

### [3.31.0 - 2023.06.12](https://github.com/zloirock/core-js/releases/tag/v3.31.0)
- [Well-formed unicode strings proposal](https://github.com/tc39/proposal-is-usv-string):
  - Methods:
    - `String.prototype.isWellFormed` method
    - `String.prototype.toWellFormed` method
  - Moved to stable ES, [May 2023 TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2023-05/may-15.md#well-formed-unicode-strings-for-stage-4)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
- [`Array` grouping proposal](https://github.com/tc39/proposal-array-grouping), [May 2023 TC39 meeting updates](https://github.com/tc39/notes/blob/main/meetings/2023-05/may-16.md#arrayprototypegroup-rename-for-web-compatibility):
  - Because of the [web compat issue](https://github.com/tc39/proposal-array-grouping/issues/44), [moved from prototype to static methods](https://github.com/tc39/proposal-array-grouping/pull/47). Added:
    - `Object.groupBy` method
    - `Map.groupBy` method (with the actual semantic - with a minor difference it was present [in the collections methods stage 1 proposal](https://github.com/tc39/proposal-collection-methods))
  - Demoted to stage 2
- [Decorator Metadata proposal](https://github.com/tc39/proposal-decorator-metadata), [May 2023 TC39 meeting updates](https://github.com/tc39/notes/blob/main/meetings/2023-05/may-16.md#decorator-metadata-for-stage-3):
  - Moved to stage 3
  - Added `Function.prototype[Symbol.metadata]` (`=== null`)
  - Added `/actual/` entries
- [Iterator Helpers stage 3 proposal](https://github.com/tc39/proposal-iterator-helpers):
  - Changed `Symbol.iterator` fallback from callable check to `undefined` / `null` check, [May 2023 TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2023-05/may-16.md#iterator-helpers-should-symboliterator-fallback-be-a-callable-check-or-an-undefinednull-check), [proposal-iterator-helpers/272](https://github.com/tc39/proposal-iterator-helpers/pull/272)
  - Removed `IsCallable` check on `NextMethod`, deferring errors to `Call` site, [May 2023 TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2023-05/may-16.md#iterator-helpers-should-malformed-iterators-fail-early-or-fail-only-when-iterated), [proposal-iterator-helpers/274](https://github.com/tc39/proposal-iterator-helpers/pull/274)
- Added [`Promise.withResolvers` stage 2 proposal](https://github.com/tc39/proposal-promise-with-resolvers):
  - `Promise.withResolvers` method
- [`Symbol` predicates stage 2 proposal](https://github.com/tc39/proposal-symbol-predicates):
  - The methods renamed to end with `Symbol`, [May 2023 TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2023-05/may-15.md#symbol-predicates):
    - `Symbol.isRegistered` -> `Symbol.isRegisteredSymbol` method
    - `Symbol.isWellKnown` -> `Symbol.isWellKnownSymbol` method
- Added `value` argument of `URLSearchParams.prototype.{ has, delete }`, [url/735](https://github.com/whatwg/url/pull/735)
- Fixed some cases of increasing buffer size in `ArrayBuffer.prototype.{ transfer, transferToFixedLength }` polyfills
- Fixed awaiting async `AsyncDisposableStack.prototype.adopt` callback, [#1258](https://github.com/zloirock/core-js/issues/1258)
- Fixed `URLSearchParams#size` in ES3 engines (IE8-)
- Added a workaround in `Object.{ entries, values }` for some IE versions bug with invisible integer keys on `null`-prototype objects
- Added TypeScript definitions to `core-js-compat`, [#1235](https://github.com/zloirock/core-js/issues/1235), thanks [**@susnux**](https://github.com/susnux)
- Compat data improvements:
  - [`Set.prototype.difference`](https://github.com/tc39/proposal-set-methods) that was missed in Bun because of [a bug](https://github.com/oven-sh/bun/issues/2309) added in 0.6.0
  - `Array.prototype.{ group, groupToMap }` marked as no longer supported in WebKit runtimes because of the mentioned above web compat issue. For example, it's disabled from Bun 0.6.2
  - Methods from the [change `Array` by copy proposal](https://github.com/tc39/proposal-change-array-by-copy) marked as supported from FF115
  - [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async) marked as supported from FF115
  - [`URL.canParse`](https://url.spec.whatwg.org/#dom-url-canparse) marked as supported from FF115
  - `value` argument of `URLSearchParams.prototype.{ has, delete }` marked as supported from [NodeJS 20.2.0](https://github.com/nodejs/node/pull/47885) and FF115
  - Added Deno 1.34 compat data mapping
  - Added Electron 26 compat data mapping
  - Added Samsung Internet 22 compat data mapping
  - Added Opera Android 75 and 76 compat data mapping
  - Added Quest Browser 27 compat data mapping

### [3.30.2 - 2023.05.07](https://github.com/zloirock/core-js/releases/tag/v3.30.2)
- Added a fix for a NodeJS 20.0.0 [bug](https://github.com/nodejs/node/issues/47612) with cloning `File` via `structuredClone`
- Added protection from Terser unsafe `String` optimization, [#1242](https://github.com/zloirock/core-js/issues/1242)
- Added a workaround for getting proper global object in Figma plugins, [#1231](https://github.com/zloirock/core-js/issues/1231)
- Compat data improvements:
  - Added NodeJS 20.0 compat data mapping
  - Added Deno 1.33 compat data mapping
  - [`URL.canParse`](https://url.spec.whatwg.org/#dom-url-canparse) marked as supported (fixed) from [NodeJS 20.1.0](https://github.com/nodejs/node/pull/47513) and [Deno 1.33.2](https://github.com/denoland/deno/pull/18896)

### [3.30.1 - 2023.04.14](https://github.com/zloirock/core-js/releases/tag/v3.30.1)
- Added a fix for a NodeJS 19.9.0 `URL.canParse` [bug](https://github.com/nodejs/node/issues/47505)
- Compat data improvements:
  - [`JSON.parse` source text access proposal](https://github.com/tc39/proposal-json-parse-with-source) features marked as [supported](https://chromestatus.com/feature/5121582673428480) from V8 ~ Chrome 114
  - [`ArrayBuffer.prototype.transfer` and friends proposal](https://github.com/tc39/proposal-arraybuffer-transfer) features marked as [supported](https://chromestatus.com/feature/5073244152922112) from V8 ~ Chrome 114
  - [`URLSearchParams.prototype.size`](https://github.com/whatwg/url/pull/734) marked as supported from V8 ~ Chrome 113

### [3.30.0 - 2023.04.04](https://github.com/zloirock/core-js/releases/tag/v3.30.0)
- Added [`URL.canParse` method](https://url.spec.whatwg.org/#dom-url-canparse), [url/763](https://github.com/whatwg/url/pull/763)
- [`Set` methods proposal](https://github.com/tc39/proposal-set-methods):
  - Removed sort from `Set.prototype.intersection`, [March 2023 TC39 meeting](https://github.com/babel/proposals/issues/87#issuecomment-1478610425), [proposal-set-methods/94](https://github.com/tc39/proposal-set-methods/pull/94)
- Iterator Helpers proposals ([sync](https://github.com/tc39/proposal-iterator-helpers), [async](https://github.com/tc39/proposal-async-iterator-helpers)):
  - Validate arguments before opening iterator, [March 2023 TC39 meeting](https://github.com/babel/proposals/issues/87#issuecomment-1478412430), [proposal-iterator-helpers/265](https://github.com/tc39/proposal-iterator-helpers/pull/265)
- Explicit Resource Management proposals ([sync](https://github.com/tc39/proposal-explicit-resource-management), [async](https://github.com/tc39/proposal-async-explicit-resource-management)):
  - `(Async)DisposableStack.prototype.move` marks the original stack as disposed, [#1226](https://github.com/zloirock/core-js/issues/1226)
  - Some simplifications like [proposal-explicit-resource-management/150](https://github.com/tc39/proposal-explicit-resource-management/pull/150)
- [`Iterator.range` proposal](https://github.com/tc39/proposal-Number.range):
  - Moved to Stage 2, [March 2023 TC39 meeting](https://github.com/babel/proposals/issues/87#issuecomment-1480266760)
- [Decorator Metadata proposal](https://github.com/tc39/proposal-decorator-metadata):
  - Returned to usage `Symbol.metadata`, [March 2023 TC39 meeting](https://github.com/babel/proposals/issues/87#issuecomment-1478790137), [proposal-decorator-metadata/12](https://github.com/tc39/proposal-decorator-metadata/pull/12)
- Compat data improvements:
  - [`URLSearchParams.prototype.size`](https://github.com/whatwg/url/pull/734) marked as supported from FF112, NodeJS 19.8 and Deno 1.32
  - Added Safari 16.4 compat data
  - Added Deno 1.32 compat data mapping
  - Added Electron 25 and updated 24 compat data mapping
  - Added Samsung Internet 21 compat data mapping
  - Added Quest Browser 26 compat data mapping
  - Updated Opera Android 74 compat data

### [3.29.1 - 2023.03.13](https://github.com/zloirock/core-js/releases/tag/v3.29.1)
- Fixed dependencies of some entries
- Fixed `ToString` conversion / built-ins nature of some accessors
- [`String.prototype.{ isWellFormed, toWellFormed }`](https://github.com/tc39/proposal-is-usv-string) marked as supported from V8 ~ Chrome 111
- Added Opera Android 74 compat data mapping

### [3.29.0 - 2023.02.27](https://github.com/zloirock/core-js/releases/tag/v3.29.0)
- Added `URLSearchParams.prototype.size` getter, [url/734](https://github.com/whatwg/url/pull/734)
- Allowed cloning resizable `ArrayBuffer`s in the `structuredClone` polyfill
- Fixed wrong export in `/(stable|actual|full)/instance/unshift` entries, [#1207](https://github.com/zloirock/core-js/issues/1207)
- Compat data improvements:
  - [`Set` methods proposal](https://github.com/tc39/proposal-set-methods) marked as supported from Bun 0.5.7
  - `String.prototype.toWellFormed` marked as fixed from Bun 0.5.7
  - Added Deno 1.31 compat data mapping

### [3.28.0 - 2023.02.14](https://github.com/zloirock/core-js/releases/tag/v3.28.0)
- [Change `Array` by copy proposal](https://github.com/tc39/proposal-change-array-by-copy):
  - Methods:
    - `Array.prototype.toReversed`
    - `Array.prototype.toSorted`
    - `Array.prototype.toSpliced`
    - `Array.prototype.with`
    - `%TypedArray%.prototype.toReversed`
    - `%TypedArray%.prototype.toSorted`
    - `%TypedArray%.prototype.with`
  - Moved to stable ES, [January 2023 TC39 meeting](https://github.com/babel/proposals/issues/86#issuecomment-1409261397)
  - Added `es.` namespace modules, `/es/` and `/stable/` namespaces entries
- Added [`JSON.parse` source text access Stage 3 proposal](https://github.com/tc39/proposal-json-parse-with-source)
  - Methods:
    - `JSON.parse` patched for support `source` in `reviver` function arguments
    - `JSON.rawJSON`
    - `JSON.isRawJSON`
    - `JSON.stringify` patched for support `JSON.rawJSON`
- Added [`ArrayBuffer.prototype.transfer` and friends Stage 3 proposal](https://github.com/tc39/proposal-arraybuffer-transfer):
  - Built-ins:
    - `ArrayBuffer.prototype.detached`
    - `ArrayBuffer.prototype.transfer` (only in runtimes with native `structuredClone` with `ArrayBuffer` transfer support)
    - `ArrayBuffer.prototype.transferToFixedLength` (only in runtimes with native `structuredClone` with `ArrayBuffer` transfer support)
  - In backwards, in runtimes with native `ArrayBuffer.prototype.transfer`, but without proper `structuredClone`, added `ArrayBuffer` transfer support to `structuredClone` polyfill
- [Iterator Helpers](https://github.com/tc39/proposal-iterator-helpers) proposal:
  - Split into 2 ([sync](https://github.com/tc39/proposal-iterator-helpers) and [async](https://github.com/tc39/proposal-async-iterator-helpers)) proposals, async version moved back to Stage 2, [January 2023 TC39 meeting](https://github.com/babel/proposals/issues/86#issuecomment-1410926068)
  - Allowed interleaved mapping in `AsyncIterator` helpers, [proposal-iterator-helpers/262](https://github.com/tc39/proposal-iterator-helpers/pull/262)
- [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) Stage 3 and [Async Explicit Resource Management](https://github.com/tc39/proposal-async-explicit-resource-management/) Stage 2 proposals:
  - `InstallErrorCause` removed from `SuppressedError`, [January 2023 TC39 meeting](https://github.com/babel/proposals/issues/86#issuecomment-1410889704), [proposal-explicit-resource-management/145](https://github.com/tc39/proposal-explicit-resource-management/pull/146)
  - Simplified internal behaviour of `{ AsyncDisposableStack, DisposableStack }.prototype.use`, [proposal-explicit-resource-management/143](https://github.com/tc39/proposal-explicit-resource-management/pull/143)
- Added [`Symbol` predicates Stage 2 proposal](https://github.com/tc39/proposal-symbol-predicates)
  - Methods:
    - `Symbol.isRegistered`
    - `Symbol.isWellKnown`
- `Number.range` Stage 1 proposal and method [renamed to `Iterator.range`](https://github.com/tc39/proposal-Number.range)
- `Function.prototype.unThis` Stage 0 proposal and method [renamed to `Function.prototype.demethodize`](https://github.com/js-choi/proposal-function-demethodize)
- Fixed [Safari `String.prototype.toWellFormed` `ToString` conversion bug](https://bugs.webkit.org/show_bug.cgi?id=251757)
- Improved some cases handling of array-replacer in `JSON.stringify` symbols handling fix
- Fixed many other old `JSON.{ parse, stringify }` bugs (numbers instead of strings as keys in replacer, handling negative zeroes, spaces, some more handling symbols cases, etc.)
- Fixed configurability and `ToString` conversion of some accessors
- Added throwing proper errors on an incorrect context in some `ArrayBuffer` and `DataView` methods
- Some minor `DataView` and `%TypedArray%` polyfills optimizations
- Added proper error on the excess number of trailing `=` in the `atob` polyfill
- Fixed theoretically possible ReDoS vulnerabilities in `String.prototype.{ trim, trimEnd, trimRight }`, `parse(Int|Float)`, `Number`, `atob`, and `URL` polyfills in some ancient engines
- Compat data improvements:
  - `RegExp.prototype.flags` marked as fixed from V8 ~ Chrome 111
  - Added Opera Android 73 compat data mapping
- Added TypeScript definitions to `core-js-builder`

### [3.27.2 - 2023.01.19](https://github.com/zloirock/core-js/releases/tag/v3.27.2)
- [`Set` methods proposal](https://github.com/tc39/proposal-set-methods) updates:
  - Closing of iterators of `Set`-like objects on early exit, [proposal-set-methods/85](https://github.com/tc39/proposal-set-methods/pull/85)
  - Some other minor internal changes
- Added one more workaround of a `webpack` dev server bug on IE global methods, [#1161](https://github.com/zloirock/core-js/issues/1161)
- Fixed possible `String.{ raw, cooked }` error with empty template array
- Used non-standard V8 `Error.captureStackTrace` instead of stack parsing in new error classes / wrappers where it's possible
- Added detection correctness of iteration to `Promise.{ allSettled, any }` feature detection, Hermes issue
- Compat data improvements:
  - [Change `Array` by copy proposal](https://github.com/tc39/proposal-change-array-by-copy) marked as supported from V8 ~ Chrome 110
  - Added Samsung Internet 20 compat data mapping
  - Added Quest Browser 25 compat data mapping
  - Added React Native 0.71 Hermes compat data
  - Added Electron 23 and 24 compat data mapping
  - `self` marked as fixed in Deno 1.29.3, [deno/17362](https://github.com/denoland/deno/pull/17362)
- Minor tweaks of minification settings for `core-js-bundle`
- Refactoring, some minor fixes, improvements, optimizations

### [3.27.1 - 2022.12.30](https://github.com/zloirock/core-js/releases/tag/v3.27.1)
- Fixed a Chakra-based MS Edge (18-) bug that unfreeze (O_o) frozen arrays used as `WeakMap` keys
- Fixing of the previous bug also fixes some cases of `String.dedent` in MS Edge
- Fixed dependencies of some entries

### [3.27.0 - 2022.12.26](https://github.com/zloirock/core-js/releases/tag/v3.27.0)
- [Iterator Helpers](https://github.com/tc39/proposal-iterator-helpers) proposal:
  - Built-ins:
    - `Iterator`
      - `Iterator.from`
      - `Iterator.prototype.drop`
      - `Iterator.prototype.every`
      - `Iterator.prototype.filter`
      - `Iterator.prototype.find`
      - `Iterator.prototype.flatMap`
      - `Iterator.prototype.forEach`
      - `Iterator.prototype.map`
      - `Iterator.prototype.reduce`
      - `Iterator.prototype.some`
      - `Iterator.prototype.take`
      - `Iterator.prototype.toArray`
      - `Iterator.prototype.toAsync`
      - `Iterator.prototype[@@toStringTag]`
    - `AsyncIterator`
      - `AsyncIterator.from`
      - `AsyncIterator.prototype.drop`
      - `AsyncIterator.prototype.every`
      - `AsyncIterator.prototype.filter`
      - `AsyncIterator.prototype.find`
      - `AsyncIterator.prototype.flatMap`
      - `AsyncIterator.prototype.forEach`
      - `AsyncIterator.prototype.map`
      - `AsyncIterator.prototype.reduce`
      - `AsyncIterator.prototype.some`
      - `AsyncIterator.prototype.take`
      - `AsyncIterator.prototype.toArray`
      - `AsyncIterator.prototype[@@toStringTag]`
  - Moved to Stage 3, [November 2022 TC39 meeting](https://github.com/babel/proposals/issues/85#issuecomment-1333474304)
  - Added `/actual/` entries, unconditional forced replacement disabled for features that survived to Stage 3
  - `.from` accept strings, `.flatMap` throws on strings returned from the callback, [proposal-iterator-helpers/244](https://github.com/tc39/proposal-iterator-helpers/pull/244), [proposal-iterator-helpers/250](https://github.com/tc39/proposal-iterator-helpers/pull/250)
  - `.from` and `.flatMap` throws on non-object *iterators*, [proposal-iterator-helpers/253](https://github.com/tc39/proposal-iterator-helpers/pull/253)
- [`Set` methods proposal](https://github.com/tc39/proposal-set-methods):
  - Built-ins:
    - `Set.prototype.intersection`
    - `Set.prototype.union`
    - `Set.prototype.difference`
    - `Set.prototype.symmetricDifference`
    - `Set.prototype.isSubsetOf`
    - `Set.prototype.isSupersetOf`
    - `Set.prototype.isDisjointFrom`
  - Moved to Stage 3, [November 2022 TC39 meeting](https://github.com/babel/proposals/issues/85#issuecomment-1332175557)
  - Reimplemented with [new semantics](https://tc39.es/proposal-set-methods/):
    - Optimized performance (iteration over lowest set)
    - Accepted only `Set`-like objects as an argument, not all iterables
    - Accepted only `Set`s as `this`, no `@@species` support, and other minor changes
  - Added `/actual/` entries, unconditional forced replacement changed to feature detection
  - For avoiding breaking changes:
    - New versions of methods are implemented as new modules and available in new entries or entries where old versions of methods were not available before (like `/actual/` namespace)
    - In entries where they were available before (like `/full/` namespace), those methods are available with fallbacks to old semantics (in addition to `Set`-like, they accept iterable objects). This behavior will be removed from the next major release
- [Well-Formed Unicode Strings](https://github.com/tc39/proposal-is-usv-string) proposal:
  - Methods:
    - `String.prototype.isWellFormed`
    - `String.prototype.toWellFormed`
  - Moved to Stage 3, [November 2022 TC39 meeting](https://github.com/babel/proposals/issues/85#issuecomment-1332180862)
  - Added `/actual/` entries, disabled unconditional forced replacement
- [Explicit resource management](https://github.com/tc39/proposal-explicit-resource-management) Stage 3 and [Async explicit resource management](https://github.com/tc39/proposal-async-explicit-resource-management) Stage 2 proposals:
  - Renamed from "`using` statement" and [split into 2 (sync and async) proposals](https://github.com/tc39/proposal-explicit-resource-management/pull/131)
  - In addition to already present well-known symbols, added new built-ins:
    - `Symbol.dispose`
    - `Symbol.asyncDispose`
    - `SuppressedError`
    - `DisposableStack`
      - `DisposableStack.prototype.dispose`
      - `DisposableStack.prototype.use`
      - `DisposableStack.prototype.adopt`
      - `DisposableStack.prototype.defer`
      - `DisposableStack.prototype.move`
      - `DisposableStack.prototype[@@dispose]`
    - `AsyncDisposableStack`
      - `AsyncDisposableStack.prototype.disposeAsync`
      - `AsyncDisposableStack.prototype.use`
      - `AsyncDisposableStack.prototype.adopt`
      - `AsyncDisposableStack.prototype.defer`
      - `AsyncDisposableStack.prototype.move`
      - `AsyncDisposableStack.prototype[@@asyncDispose]`
    - `Iterator.prototype[@@dispose]`
    - `AsyncIterator.prototype[@@asyncDispose]`
  - Sync version of this proposal moved to Stage 3, [November 2022 TC39 meeting](https://github.com/babel/proposals/issues/85#issuecomment-1333747094)
  - Added `/actual/` namespace entries for Stage 3 proposal
- Added [`String.dedent` stage 2 proposal](https://github.com/tc39/proposal-string-dedent)
  - Method `String.dedent`
  - Throws an error on non-frozen raw templates for avoiding possible breaking changes in the future, [proposal-string-dedent/75](https://github.com/tc39/proposal-string-dedent/issues/75)
- [Compat data targets](/packages/core-js-compat#targets-option) improvements:
  - [React Native from 0.70 shipped with Hermes as the default engine.](https://reactnative.dev/blog/2022/07/08/hermes-as-the-default) However, bundled Hermes versions differ from standalone Hermes releases. So added **`react-native`** target for React Native with bundled Hermes.
  - [According to the documentation](https://developer.oculus.com/documentation/web/browser-intro/), Oculus Browser was renamed to Meta Quest Browser, so `oculus` target was renamed to **`quest`**.
  - `opera_mobile` target name is confusing since it contains data for the Chromium-based Android version, but iOS Opera is Safari-based. So `opera_mobile` target was renamed to **`opera-android`**.
  - `android` target name is also confusing for someone - that means Android WebView, some think thinks that it's Chrome for Android, but they have some differences. For avoiding confusion, added **`chrome-android`** target.
  - For consistency with two previous cases, added **`firefox-android`** target.
  - For avoiding breaking changes, the `oculus` and `opera_mobile` fields are available in the compat data till the next major release.
- Compat data improvements:
  - [`Array.fromAsync`](https://github.com/tc39/proposal-array-from-async) marked as supported from Bun 0.3.0
  - [`String.prototype.{ isWellFormed, toWellFormed }`](https://github.com/tc39/proposal-is-usv-string) marked as supported from Bun 0.4.0
  - [Change `Array` by copy proposal](https://github.com/tc39/proposal-change-array-by-copy) marked as supported from Deno 1.27, [deno/16429](https://github.com/denoland/deno/pull/16429)
  - Added Deno 1.28 / 1.29 compat data mapping
  - Added NodeJS 19.2 compat data mapping
  - Added Samsung Internet 19.0 compat data mapping
  - Added Quest Browser 24.0 compat data mapping
  - Fixed the first version in the Chromium-based Edge compat data mapping
- `{ Map, WeakMap }.prototype.emplace` became stricter [by the spec draft](https://tc39.es/proposal-upsert/)
- Smoothed behavior of some conflicting proposals
- Removed some generic behavior (like `@@species` pattern) of some `.prototype` methods from the [new collections methods proposal](https://github.com/tc39/proposal-collection-methods) and the [`Array` deduplication proposal](https://github.com/tc39/proposal-array-unique) that *most likely* will not be implemented since it contradicts the current TC39 policy
- Added pure version of the `Number` constructor, [#1154](https://github.com/zloirock/core-js/issues/1154), [#1155](https://github.com/zloirock/core-js/issues/1155), thanks [@trosos](https://github.com/trosos)
- Added `set(Timeout|Interval|Immediate)` extra arguments fix for Bun 0.3.0- (similarly to IE9-), [bun/1633](https://github.com/oven-sh/bun/issues/1633)
- Fixed handling of sparse arrays in `structuredClone`, [#1156](https://github.com/zloirock/core-js/issues/1156)
- Fixed a theoretically possible future conflict of polyfills definitions in the pure version
- Some refactoring and optimization

### [3.26.1 - 2022.11.14](https://github.com/zloirock/core-js/releases/tag/v3.26.1)
- Disabled forced replacing of `Array.fromAsync` since it's on Stage 3
- Avoiding a check of the target in the internal `function-uncurry-this` helper where it's not required - minor optimization and preventing problems in some broken environments, a workaround of [#1141](https://github.com/zloirock/core-js/issues/1141)
- V8 will not ship `Array.prototype.{ group, groupToMap }` in V8 ~ Chromium 108, [proposal-array-grouping/44](https://github.com/tc39/proposal-array-grouping/issues/44#issuecomment-1306311107)

### [3.26.0 - 2022.10.24](https://github.com/zloirock/core-js/releases/tag/v3.26.0)
- [`Array.fromAsync` proposal](https://github.com/tc39/proposal-array-from-async):
  - Moved to Stage 3, [September TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2022-09/sep-14.md#arrayfromasync-for-stage-3)
  - Avoid observable side effects of `%Array.prototype.values%` usage in array-like branch, [proposal-array-from-async/30](https://github.com/tc39/proposal-array-from-async/pull/30)
- Added [well-formed unicode strings stage 2 proposal](https://github.com/tc39/proposal-is-usv-string):
  - `String.prototype.isWellFormed`
  - `String.prototype.toWellFormed`
- Recent updates of the [iterator helpers proposal](https://github.com/tc39/proposal-iterator-helpers):
  - Added a counter parameter to helpers, [proposal-iterator-helpers/211](https://github.com/tc39/proposal-iterator-helpers/pull/211)
  - Don't await non-objects returned from functions passed to `AsyncIterator` helpers, [proposal-iterator-helpers/239](https://github.com/tc39/proposal-iterator-helpers/pull/239)
  - `{ Iterator, AsyncIterator }.prototype.flatMap` supports returning both - iterables and iterators, [proposal-iterator-helpers/233](https://github.com/tc39/proposal-iterator-helpers/pull/233)
  - Early exit on broken `.next` in missed cases of `{ Iterator, AsyncIterator }.from`, [proposal-iterator-helpers/232](https://github.com/tc39/proposal-iterator-helpers/pull/232)
- Added `self` polyfill as a part of [The Minimum Common Web Platform API](https://common-min-api.proposal.wintercg.org/), [specification](https://html.spec.whatwg.org/multipage/window-object.html#dom-self), [#1118](https://github.com/zloirock/core-js/issues/1118)
- Added `inverse` option to `core-js-compat`, [#1119](https://github.com/zloirock/core-js/issues/1119)
- Added `format` option to `core-js-builder`, [#1120](https://github.com/zloirock/core-js/issues/1120)
- Added NodeJS 19.0 compat data
- Added Deno 1.26 and 1.27 compat data
- Added Opera Android 72 compat data mapping
- Updated Electron 22 compat data mapping

### [3.25.5 - 2022.10.04](https://github.com/zloirock/core-js/releases/tag/v3.25.5)
- Fixed regression with an error on reuse of some built-in methods from another realm, [#1133](https://github.com/zloirock/core-js/issues/1133)

### [3.25.4 - 2022.10.03](https://github.com/zloirock/core-js/releases/tag/v3.25.4)
- Added a workaround of a Nashorn bug with `Function.prototype.{ call, apply, bind }` on string methods, [#1128](https://github.com/zloirock/core-js/issues/1128)
- Updated lists of `[Serializable]` and `[Transferable]` objects in the `structuredClone` polyfill. Mainly, for better error messages if polyfilling of cloning such types is impossible
- `Array.prototype.{ group, groupToMap }` marked as [supported from V8 ~ Chromium 108](https://chromestatus.com/feature/5714791975878656)
- Added Electron 22 compat data mapping

### [3.25.3 - 2022.09.26](https://github.com/zloirock/core-js/releases/tag/v3.25.3)
- Forced polyfilling of `Array.prototype.groupToMap` in the pure version for returning wrapped `Map` instances
- Fixed existence of `Array.prototype.{ findLast, findLastIndex }` in `/stage/4` entry
- Added Opera Android 71 compat data mapping
- Some stylistic changes

### [3.25.2 - 2022.09.19](https://github.com/zloirock/core-js/releases/tag/v3.25.2)
- Considering `document.all` as a callable in some missed cases
- Added Safari 16.0 compat data
- Added iOS Safari 16.0 compat data mapping
- Fixed some ancient iOS Safari versions compat data mapping

### [3.25.1 - 2022.09.08](https://github.com/zloirock/core-js/releases/tag/v3.25.1)
- Added some fixes and workarounds of FF30- typed arrays bug that does not properly convert objects to numbers
- Added `sideEffects` field to `core-js-pure` `package.json` for better tree shaking, [#1117](https://github.com/zloirock/core-js/issues/1117)
- Dropped `semver` dependency from `core-js-compat`
  - `semver` package (ironically) added [a breaking change and dropped NodeJS 8 support in the minor `7.1` version](https://github.com/npm/node-semver/commit/d61f828e64260a0a097f26210f5500), after that `semver` in `core-js-compat` was pinned to `7.0` since for avoiding breaking changes it should support NodeJS 8. However, since `core-js-compat` is usually used with other packages that use `semver` dependency, it causes multiple duplication of `semver` in dependencies. So I decided to remove `semver` dependency and replace it with a couple of simple helpers.
- Added Bun 0.1.6-0.1.11 compat data
- Added Deno 1.25 compat data mapping
- Updated Electron 21 compat data mapping
- Some stylistic changes, minor fixes, and improvements

### [3.25.0 - 2022.08.25](https://github.com/zloirock/core-js/releases/tag/v3.25.0)
- Added [`Object.prototype.__proto__`](https://tc39.es/ecma262/#sec-object.prototype.__proto__) polyfill
  - It's optional, legacy, and in some cases (mainly because of developers' mistakes) can cause problems, but [some libraries depend on it](https://github.com/denoland/deno/issues/13321), and most code can't work without the proper libraries' ecosystem
  - Only for modern engines where this feature is missed (like Deno), it's not installed in IE10- since here we have no proper way setting of the prototype
  - Without fixes of early implementations where it's not an accessor since those fixes are impossible
  - Only for the global version
- Considering `document.all` as an object in some missed cases, see [ECMAScript Annex B 3.6](https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot)
- Avoiding unnecessary promise creation and validation result in `%WrapForValid(Async)IteratorPrototype%.return`, [proposal-iterator-helpers/215](https://github.com/tc39/proposal-iterator-helpers/pull/215)
- Fixed omitting the result of proxing `.return` in `%IteratorHelperPrototype%.return`, [#1116](https://github.com/zloirock/core-js/issues/1116)
- Fixed the order creation of properties of iteration result object of some iterators (`value` should be created before `done`)
- Fixed some cases of Safari < 13 bug - silent on non-writable array `.length` setting
- Fixed `ArrayBuffer.length` in V8 ~ Chrome 27-
- Relaxed condition of re-usage native `WeakMap` for internal states with multiple `core-js` copies
- Availability cloning of `FileList` in the `structuredClone` polyfill extended to some more old engines versions
- Some stylistic changes and minor fixes
- Throwing a `TypeError` in `core-js-compat` / `core-js-builder` in case of passing invalid module names / filters for avoiding unexpected result, related to [#1115](https://github.com/zloirock/core-js/issues/1115)
- Added missed NodeJS 13.2 to `esmodules` `core-js-compat` / `core-js-builder` target
- Added Electron 21 compat data mapping
- Added Oculus Browser 23.0 compat data mapping

### [3.24.1 - 2022.07.30](https://github.com/zloirock/core-js/releases/tag/v3.24.1)
- NodeJS is ignored in `IS_BROWSER` detection to avoid a false positive with `jsdom`, [#1110](https://github.com/zloirock/core-js/issues/1110)
- Fixed detection of `@@species` support in `Promise` in some old engines
- `{ Array, %TypedArray% }.prototype.{ findLast, findLastIndex }` marked as shipped [in FF104](https://bugzilla.mozilla.org/show_bug.cgi?id=1775026)
- Added iOS Safari 15.6 compat data mapping
- Fixed Opera 15 compat data mapping

### [3.24.0 - 2022.07.25](https://github.com/zloirock/core-js/releases/tag/v3.24.0)
- Recent updates of the [iterator helpers proposal](https://github.com/tc39/proposal-iterator-helpers), [#1101](https://github.com/zloirock/core-js/issues/1101):
  - `.asIndexedPairs` renamed to `.indexed`, [proposal-iterator-helpers/183](https://github.com/tc39/proposal-iterator-helpers/pull/183):
    - `Iterator.prototype.asIndexedPairs` -> `Iterator.prototype.indexed`
    - `AsyncIterator.prototype.asIndexedPairs` -> `AsyncIterator.prototype.indexed`
  - Avoid exposing spec fiction `%AsyncFromSyncIteratorPrototype%` in `AsyncIterator.from` and `Iterator.prototype.toAsync`, [proposal-iterator-helpers/182](https://github.com/tc39/proposal-iterator-helpers/pull/182), [proposal-iterator-helpers/202](https://github.com/tc39/proposal-iterator-helpers/pull/202)
  - Avoid unnecessary promise creation in `%WrapForValidAsyncIteratorPrototype%.next`, [proposal-iterator-helpers/197](https://github.com/tc39/proposal-iterator-helpers/pull/197)
  - Do not validate value in `%WrapForValid(Async)IteratorPrototype%.next`, [proposal-iterator-helpers/197](https://github.com/tc39/proposal-iterator-helpers/pull/197) and [proposal-iterator-helpers/205](https://github.com/tc39/proposal-iterator-helpers/pull/205)
  - Do not forward the parameter of `.next` / `.return` to an underlying iterator by the extended iterator protocol, a part of [proposal-iterator-helpers/194](https://github.com/tc39/proposal-iterator-helpers/pull/194)
  - `.throw` methods removed from all wrappers / helpers prototypes, a part of [proposal-iterator-helpers/194](https://github.com/tc39/proposal-iterator-helpers/pull/194)
  - Close inner iterators of `{ Iterator, AsyncIterator }.prototype.flatMap` proxy iterators on `.return`, [proposal-iterator-helpers/195](https://github.com/tc39/proposal-iterator-helpers/pull/195)
  - Throw `RangeError` on `NaN` in `{ Iterator, AsyncIterator }.prototype.{ drop, take }`, [proposal-iterator-helpers/181](https://github.com/tc39/proposal-iterator-helpers/pull/181)
  - Many other updates and fixes of this proposal
- `%TypedArray%.prototype.toSpliced` method removed from the [change array by copy proposal](https://github.com/tc39/proposal-change-array-by-copy) and marked as obsolete in `core-js`, [proposal-change-array-by-copy/88](https://github.com/tc39/proposal-change-array-by-copy/issues/88)
- Polyfill `Promise` with `unhandledrejection` event support (browser style) in Deno < [1.24](https://github.com/denoland/deno/releases/tag/v1.24.0)
- Available new targets in `core-js-compat` / `core-js-builder` and added compat data for them:
  - Bun (`bun`), compat data for 0.1.1-0.1.5, [#1103](https://github.com/zloirock/core-js/issues/1103)
  - Hermes (`hermes`), compat data for 0.1-0.11, [#1099](https://github.com/zloirock/core-js/issues/1099)
  - Oculus Browser (`oculus`), compat data mapping for 3.0-22.0, [#1098](https://github.com/zloirock/core-js/issues/1098)
- Added Samsung Internet 18.0 compat data mapping

### [3.23.5 - 2022.07.18](https://github.com/zloirock/core-js/releases/tag/v3.23.5)
- Fixed a typo in the `structuredClone` feature detection, [#1106](https://github.com/zloirock/core-js/issues/1106)
- Added Opera Android 70 compat data mapping

### [3.23.4 - 2022.07.10](https://github.com/zloirock/core-js/releases/tag/v3.23.4)
- Added a workaround of the Bun ~ 0.1.1 [bug](https://github.com/Jarred-Sumner/bun/issues/399) that define some globals with incorrect property descriptors and that causes a crash of `core-js`
- Added a fix of the FF103+ `structuredClone` bugs ([1774866](https://bugzilla.mozilla.org/show_bug.cgi?id=1774866) (fixed in FF104) and [1777321](https://bugzilla.mozilla.org/show_bug.cgi?id=1777321) (still not fixed)) that now can clone errors, but `.stack` of the clone is an empty string
- Fixed `{ Map, WeakMap }.prototype.emplace` logic, [#1102](https://github.com/zloirock/core-js/issues/1102)
- Fixed order of errors throwing on iterator helpers

### [3.23.3 - 2022.06.26](https://github.com/zloirock/core-js/releases/tag/v3.23.3)
- Changed the order of operations in `%TypedArray%.prototype.toSpliced` following [proposal-change-array-by-copy/89](https://github.com/tc39/proposal-change-array-by-copy/issues/89)
- Fixed regression of some IE8- issues

### [3.23.2 - 2022.06.21](https://github.com/zloirock/core-js/releases/tag/v3.23.2)
- Avoided creation of extra properties for the handling of `%TypedArray%` constructors in new methods, [#1092 (comment)](https://github.com/zloirock/core-js/issues/1092#issuecomment-1158760512)
- Added Deno 1.23 compat data mapping

### [3.23.1 - 2022.06.14](https://github.com/zloirock/core-js/releases/tag/v3.23.1)
- Fixed possible error on multiple `core-js` copies, [#1091](https://github.com/zloirock/core-js/issues/1091)
- Added `v` flag to `RegExp.prototype.flags` implementation in case if current V8 bugs will not be fixed before this flag implementation

### [3.23.0 - 2022.06.14](https://github.com/zloirock/core-js/releases/tag/v3.23.0)
- [`Array` find from last](https://github.com/tc39/proposal-array-find-from-last) moved to the stable ES, according to June 2022 TC39 meeting:
  - `Array.prototype.findLast`
  - `Array.prototype.findLastIndex`
  - `%TypedArray%.prototype.findLast`
  - `%TypedArray%.prototype.findLastIndex`
- Methods from [the `Array` grouping proposal](https://github.com/tc39/proposal-array-grouping) [renamed](https://github.com/tc39/proposal-array-grouping/pull/39), according to June 2022 TC39 meeting:
  - `Array.prototype.groupBy` -> `Array.prototype.group`
  - `Array.prototype.groupByToMap` -> `Array.prototype.groupToMap`
- Changed the order of operations in `%TypedArray%.prototype.with` following [proposal-change-array-by-copy/86](https://github.com/tc39/proposal-change-array-by-copy/issues/86), according to June 2022 TC39 meeting
- [Decorator Metadata proposal](https://github.com/tc39/proposal-decorator-metadata) extracted from [Decorators proposal](https://github.com/tc39/proposal-decorators) as a separate stage 2 proposal, according to March 2022 TC39 meeting, `Symbol.metadataKey` replaces `Symbol.metadata`
- Added `Array.prototype.push` polyfill with some fixes for modern engines
- Added `Array.prototype.unshift` polyfill with some fixes for modern engines
- Fixed a bug in the order of getting flags in `RegExp.prototype.flags` in the actual version of V8
- Fixed property descriptors of some `Math` and `Number` constants
- Added a workaround of V8 `ArrayBufferDetaching` protector cell invalidation and performance degradation on `structuredClone` feature detection, one more case of [#679](https://github.com/zloirock/core-js/issues/679)
- Added detection of NodeJS [bug](https://github.com/nodejs/node/issues/41038) in `structuredClone` that can not clone `DOMException` (just in case for future versions that will fix other issues)
- Compat data:
  - Added NodeJS 18.3 compat data mapping
  - Added and fixed Deno 1.22 and 1.21 compat data mapping
  - Added Opera Android 69 compat data mapping
  - Updated Electron 20.0 compat data mapping

### [3.22.8 - 2022.06.02](https://github.com/zloirock/core-js/releases/tag/v3.22.8)
- Fixed possible multiple call of `ToBigInt` / `ToNumber` conversion of the argument passed to `%TypedArray%.prototype.fill` in V8 ~ Chrome < 59, Safari < 14.1, FF < 55, Edge <=18
- Fixed some cases of `DeletePropertyOrThrow` in IE9-
- Fixed the kind of error (`TypeError` instead of `Error`) on incorrect `exec` result in `RegExp.prototype.test` polyfill
- Fixed dependencies of `{ actual, full, features }/typed-array/at` entries
- Added Electron 20.0 compat data mapping
- Added iOS Safari 15.5 compat data mapping
- Refactoring

### [3.22.7 - 2022.05.24](https://github.com/zloirock/core-js/releases/tag/v3.22.7)
- Added a workaround for V8 ~ Chrome 53 bug with non-writable prototype of some methods, [#1083](https://github.com/zloirock/core-js/issues/1083)

### [3.22.6 - 2022.05.23](https://github.com/zloirock/core-js/releases/tag/v3.22.6)
- Fixed possible double call of `ToNumber` conversion on arguments of `Math.{ fround, trunc }` polyfills
- `Array.prototype.includes` marked as [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1767541) in FF102

### [3.22.5 - 2022.05.10](https://github.com/zloirock/core-js/releases/tag/v3.22.5)
- Ensured that polyfilled constructors `.prototype` is non-writable
- Ensured that polyfilled methods `.prototype` is not defined
- Added detection and fix of a V8 ~ Chrome <103 [bug](https://bugs.chromium.org/p/v8/issues/detail?id=12542) of `struturedClone` that returns `null` if cloned object contains multiple references to one error

### [3.22.4 - 2022.05.03](https://github.com/zloirock/core-js/releases/tag/v3.22.4)
- Ensured proper `.length` of polyfilled functions even in compressed code (excepting some ancient engines)
- Ensured proper `.name` of polyfilled accessors (excepting some ancient engines)
- Ensured proper source / `ToString` conversion of polyfilled accessors
- Actualized Rhino compat data
- Refactoring

### [3.22.3 - 2022.04.28](https://github.com/zloirock/core-js/releases/tag/v3.22.3)
- Added a fix for FF99+ `Array.prototype.includes` broken on sparse arrays

### [3.22.2 - 2022.04.21](https://github.com/zloirock/core-js/releases/tag/v3.22.2)
- Fixed `URLSearchParams` in IE8- that was broken in the previous release
- Fixed `__lookupGetter__` entries

### [3.22.1 - 2022.04.20](https://github.com/zloirock/core-js/releases/tag/v3.22.1)
- Improved some cases of `RegExp` flags handling
- Prevented experimental warning in NodeJS ~ 18.0 on detection `fetch` API
- Added NodeJS 18.0 compat data

### [3.22.0 - 2022.04.15](https://github.com/zloirock/core-js/releases/tag/v3.22.0)
- [Change `Array` by copy proposal](https://github.com/tc39/proposal-change-array-by-copy):
  - Moved to Stage 3, [March TC39 meeting](https://github.com/babel/proposals/issues/81#issuecomment-1083449843)
  - Disabled forced replacement and added `/actual/` entry points for methods from this proposal
  - `Array.prototype.toSpliced` throws a `TypeError` instead of `RangeError` if the result length is more than `MAX_SAFE_INTEGER`, [proposal-change-array-by-copy/70](https://github.com/tc39/proposal-change-array-by-copy/pull/70)
- Added some more `atob` / `btoa` fixes:
  - NodeJS <17.9 `atob` does not ignore spaces, [node/42530](https://github.com/nodejs/node/issues/42530)
  - Actual NodeJS `atob` does not validate encoding, [node/42646](https://github.com/nodejs/node/issues/42646)
  - FF26- implementation does not properly convert argument to string
  - IE / Edge <16 implementation have wrong arity
- Added `/full/` namespace as the replacement for `/features/` since it's more descriptive in context of the rest namespaces (`/es/` ⊆ `/stable/` ⊆ `/actual/` ⊆ `/full/`)
- Avoided propagation of removed parts of proposals to upper stages. For example, `%TypedArray%.prototype.groupBy` was removed from the `Array` grouping proposal a long time ago. We can't completely remove this method since it's a breaking change. But this proposal has been promoted to stage 3 - so the proposal should be promoted without this method, this method should not be available in `/actual/` entries - but it should be available in early-stage entries to avoid breakage.
- Significant internal refactoring and splitting of modules (but without exposing to public API since it will be a breaking change - it will be exposed in the next major version)
- Bug fixes:
  - Fixed work of non-standard V8 `Error` features with wrapped `Error` constructors, [#1061](https://github.com/zloirock/core-js/issues/1061)
  - `null` and `undefined` allowed as the second argument of `structuredClone`, [#1056](https://github.com/zloirock/core-js/issues/1056)
- Tooling:
  - Stabilized proposals are filtered out from the `core-js-compat` -> `core-js-builder` -> `core-js-bundle` output. That mean that if the output contains, for example, `es.object.has-own`, the legacy reference to it, `esnext.object.has-own`, no longer added.
  - Aligned modules filters of [`core-js-builder`](https://github.com/zloirock/core-js/tree/master/packages/core-js-builder) and [`core-js-compat`](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat), now it's `modules` and `exclude` options
  - Added support of entry points, modules, regexes, and arrays of them to those filters
  - Missed `targets` option of `core-js-compat` means that the `targets` filter just will not be applied, so the result will contain modules required for all possible engines
- Compat data:
  - `.stack` property on `DOMException` marked as supported from Deno [1.15](https://github.com/denoland/deno/releases/tag/v1.15.0)
  - Added Deno 1.21 compat data mapping
  - Added Electron 19.0 and updated 18.0 compat data mapping
  - Added Samsung Internet 17.0 compat data mapping
  - Added Opera Android 68 compat data mapping

### [3.21.1 - 2022.02.17](https://github.com/zloirock/core-js/releases/tag/v3.21.1)
- Added a [bug](https://bugs.webkit.org/show_bug.cgi?id=236541)fix for the WebKit `Array.prototype.{ groupBy, groupByToMap }` implementation
- `core-js-compat` targets parser transforms engine names to lower case
- `atob` / `btoa` marked as [fixed](https://github.com/nodejs/node/pull/41478) in NodeJS 17.5
- Added Electron 18.0 compat data mapping
- Added Deno 1.20 compat data mapping

### [3.21.0 - 2022.02.02](https://github.com/zloirock/core-js/releases/tag/v3.21.0)
- Added [Base64 utility methods](https://developer.mozilla.org/en-US/docs/Glossary/Base64):
  - `atob`
  - `btoa`
- Added the proper validation of arguments to some methods from web standards
- Forced replacement of all features from early-stage proposals for avoiding possible web compatibility issues in the future
- Added Rhino 1.7.14 compat data
- Added Deno 1.19 compat data mapping
- Added Opera Android 66 and 67 compat data mapping
- Added iOS Safari 15.3 and 15.4 compat data mapping

### [3.20.3 - 2022.01.15](https://github.com/zloirock/core-js/releases/tag/v3.20.3)
- Detects and replaces broken third-party `Function#bind` polyfills, uses only native `Function#bind` in the internals
- `structuredClone` should throw an error if no arguments passed
- Changed the structure of notes in `__core-js_shared__`

### [3.20.2 - 2022.01.02](https://github.com/zloirock/core-js/releases/tag/v3.20.2)
- Added a fix of [a V8 ~ Chrome 36- `Object.{ defineProperty, defineProperties }` bug](https://bugs.chromium.org/p/v8/issues/detail?id=3334), [Babel issue](https://github.com/babel/babel/issues/14056)
- Added fixes of some different `%TypedArray%.prototype.set` bugs, affects modern engines (like Chrome < 95 or Safari < 14.1)

### [3.20.1 - 2021.12.23](https://github.com/zloirock/core-js/releases/tag/v3.20.1)
- Fixed the order of calling reactions of already fulfilled / rejected promises in `Promise.prototype.then`, [#1026](https://github.com/zloirock/core-js/issues/1026)
- Fixed possible memory leak in specific promise chains
- Fixed some missed dependencies of entries
- Added Deno 1.18 compat data mapping

### [3.20.0 - 2021.12.16](https://github.com/zloirock/core-js/releases/tag/v3.20.0)
- Added `structuredClone` method [from the HTML spec](https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone), [see MDN](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
  - Includes all cases of cloning and transferring of required ECMAScript and platform types that can be polyfilled, for the details see [the caveats](https://github.com/zloirock/core-js#caveats-when-using-structuredclone-polyfill)
  - Uses native structured cloning algorithm implementations where it's possible
  - Includes the new semantic of errors cloning from [`html/5749`](https://github.com/whatwg/html/pull/5749)
- Added `DOMException` polyfill, [the Web IDL spec](https://webidl.spec.whatwg.org/#idl-DOMException), [see MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMException)
  - Includes `DOMException` and its attributes polyfills with fixes of many different engines bugs
  - Includes `DOMException#stack` property polyfill in engines that should have it
  - Reuses native `DOMException` implementations where it's possible (for example, in old NodeJS where it's not exposed as global)
- Added [support of `cause` on all Error types](https://github.com/tc39/proposal-error-cause)
- Added `Error.prototype.toString` method polyfill with fixes of many different bugs of JS engines
- Added `Number.prototype.toExponential` method polyfill with fixes of many different bugs of JS engines
- [`Array` grouping proposal](https://github.com/tc39/proposal-array-grouping):
  - Moved to stage 3
  - Added `Array.prototype.groupByToMap` method
  - Removed `@@species` support
- Added [change `Array` by copy stage 2 proposal](https://github.com/tc39/proposal-change-array-by-copy):
  - `Array.prototype.toReversed`
  - `Array.prototype.toSorted`
  - `Array.prototype.toSpliced`
  - `Array.prototype.with`
  - `%TypedArray%.prototype.toReversed`
  - `%TypedArray%.prototype.toSorted`
  - `%TypedArray%.prototype.toSpliced`
  - `%TypedArray%.prototype.with`
- Added `Iterator.prototype.toAsync` method from [the iterator helpers stage 2 proposal](https://github.com/tc39/proposal-iterator-helpers)
- [`Array.fromAsync` proposal](https://github.com/tc39/proposal-array-from-async) moved to stage 2
- Added [`String.cooked` stage 1 proposal](https://github.com/tc39/proposal-string-cooked)
- Added [`Function.prototype.unThis` stage 0 proposal](https://github.com/js-choi/proposal-function-un-this)
- Added [`Function.{ isCallable, isConstructor }` stage 0 proposal](https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md):
  - `Function.isCallable`
  - `Function.isConstructor`
- Added a workaround of most cases breakage modern `String#at` after loading obsolete `String#at` proposal module, [#1019](https://github.com/zloirock/core-js/issues/1019)
- Fixed `Array.prototype.{ values, @@iterator }.name` in V8 ~ Chrome 45-
- Fixed validation of typed arrays in typed arrays iteration methods in V8 ~ Chrome 50-
- Extension of the API, [#1012](https://github.com/zloirock/core-js/issues/1012)
  - Added a new `core-js/actual/**` namespace
  - Added entry points for each finished post-ES6 proposal

### [3.19.3 - 2021.12.06](https://github.com/zloirock/core-js/releases/tag/v3.19.3)
- Fixed internal slots check in methods of some built-in types, [#1017](https://github.com/zloirock/core-js/issues/1017)
- Fixed `URLSearchParams` iterator `.next` that should be enumerable [by the spec](https://webidl.spec.whatwg.org/#es-iterator-prototype-object)
- Refactored `Subscription`
- Added NodeJS 17.2 compat data mapping

### [3.19.2 - 2021.11.29](https://github.com/zloirock/core-js/releases/tag/v3.19.2)
- Added a workaround for a UC Browser specific version bug with unobservable `RegExp#sticky` flag, [#1008](https://github.com/zloirock/core-js/issues/1008), [#1015](https://github.com/zloirock/core-js/issues/1015)
- Added handling of comments and specific spaces to `Function#name` polyfill, [#1010](https://github.com/zloirock/core-js/issues/1010), thanks [@ildar-shaimordanov](https://github.com/ildar-shaimordanov)
- Prevented some theoretical cases of breaking / observing the internal state by patching `Array.prototype[@@species]`
- Refactored `URL` and `URLSearchParams`
- Added iOS Safari 15.2 compat data mapping
- Added Electron 17.0 compat data mapping
- Updated Deno compat data mapping

### [3.19.1 - 2021.11.03](https://github.com/zloirock/core-js/releases/tag/v3.19.1)
- Added a workaround for FF26- bug where `ArrayBuffer`s are non-extensible, but `Object.isExtensible` does not report it:
  - Fixed in `Object.{ isExtensible, isSealed, isFrozen }` and `Reflect.isExtensible`
  - Fixed handling of `ArrayBuffer`s as collections keys
- Fixed `Object#toString` on `AggregateError` in IE10-
- Fixed possible lack of dependencies of `WeakMap` in IE8-
- `.findLast` methods family marked as supported [from Chrome 97](https://chromestatus.com/features#milestone%3D97)
- Fixed inheritance of Electron compat data `web.` modules
- Fixed Safari 15.1 compat data (some features were not added)
- Added iOS Safari 15.1 compat data mapping

### [3.19.0 - 2021.10.25](https://github.com/zloirock/core-js/releases/tag/v3.19.0)
- Most built-ins are encapsulated in `core-js` for preventing possible cases of breaking / observing the internal state by patching / deleting of them
  - Avoid `.call` / `.apply` prototype methods that could be patched
  - Avoid `instanceof` operator - implicit `.prototype` / `@@hasInstance` access that could be patched
  - Avoid `RegExp#test`, `String#match` and some over methods - implicit `.exec` and `RegExp` well-known symbols access that could be patched
- Clearing of `Error` stack from extra entries experimentally added to `AggregateError`, [#996](https://github.com/zloirock/core-js/pull/996), in case lack of problems it will be extended to other cases
- In engines with native `Symbol` support, new well-known symbols created with usage `Symbol.for` for ensuring the same keys in different realms, [#998](https://github.com/zloirock/core-js/issues/998)
- Added a workaround of [a BrowserFS NodeJS `process` polyfill bug](https://github.com/jvilk/bfs-process/issues/5) that incorrectly reports V8 version that's used in some cases of `core-js` feature detection
- Fixed normalization of `message` `AggregateError` argument
- Fixed order of arguments conversion in `Math.scale`, [a spec draft bug](https://github.com/rwaldron/proposal-math-extensions/issues/24)
- Fixed `core-js-builder` work in NodeJS 17, added a workaround of [`webpack` + NodeJS 17 issue](https://github.com/webpack/webpack/issues/14532)
- Added NodeJS 17.0 compat data mapping
- Added Opera Android 65 compat data mapping
- Updated Electron 16.0 compat data mapping
- Many other minor fixes and improvements

### [3.18.3 - 2021.10.13](https://github.com/zloirock/core-js/releases/tag/v3.18.3)
- Fixed the prototype chain of `AggregateError` constructor that should contain `Error` constructor
- Fixed incorrect `AggregateError.prototype` properties descriptors
- Fixed `InstallErrorCause` internal operation
- Added NodeJS 16.11 compat data mapping
- Added Deno 1.16 compat data mapping
- `Object.hasOwn` marked as supported from Safari 15.1

### [3.18.2 - 2021.10.06](https://github.com/zloirock/core-js/releases/tag/v3.18.2)
- Early `{ Array, %TypedArray% }.fromAsync` errors moved to the promise, per the latest changes of the spec draft
- Internal `ToInteger(OrInfinity)` operation returns `+0` for `-0` argument, ES2020+ update
- Fixed theoretical problems with handling bigint in `Number` constructor wrapper
- Fixed `String.raw` with extra arguments
- Fixed some missed dependencies in entry points
- Some other minor fixes and improvements
- Refactoring

### [3.18.1 - 2021.09.27](https://github.com/zloirock/core-js/releases/tag/v3.18.1)
- Fixed `String.prototype.substr` feature detection and compat data
- Removed mistakenly added `.forEach` from prototypes of some DOM collections where it shouldn't be, [#988](https://github.com/zloirock/core-js/issues/988), [#987](https://github.com/zloirock/core-js/issues/987), thanks [@moorejs](https://github.com/moorejs)
- Added `cause` to `AggregateError` constructor implementation (still without adding to the feature detection)
- Families of `.at` and `.findLast` methods marked as supported in Safari TP
- Added Electron 16.0 compat data mapping

### [3.18.0 - 2021.09.20](https://github.com/zloirock/core-js/releases/tag/v3.18.0)
- Added [`Array.fromAsync` stage 1 proposal](https://github.com/tc39/proposal-array-from-async):
  - `Array.fromAsync`
  - `%TypedArray%.fromAsync`
- `.name` and `.toString()` on polyfilled functions improved in many different cases
- Improved internal `IsConstructor` and `IsCallable` checks
- Fixed some internal cases of `GetMethod` operation
- Fixed a bug of MS Edge 18- `parseInt` / `parseFloat` with boxed symbols
- Fixed `es.array.{ index-of, last-index-of }` compat data
- Added Deno 1.15 compat data mapping
- Some other minor fixes and optimizations

### [3.17.3 - 2021.09.09](https://github.com/zloirock/core-js/releases/tag/v3.17.3)
- Fixed some possible problems related to possible extension of `%IteratorPrototype%` and `%AsyncIteratorPrototype%` in the future
- Fixed `DOMTokenList.prototype.{ forEach, @@iterator, keys, values, entries }` in old WebKit versions where `element.classList` is not an instance of global `DOMTokenList`
- Added NodeJS 16.9 compat data mapping
- Added Samsung Internet 16.0 compat data mapping

### [3.17.2 - 2021.09.03](https://github.com/zloirock/core-js/releases/tag/v3.17.2)
- Fixed missed cases of ES3 reserved words usage, related to [#980](https://github.com/zloirock/core-js/issues/980)
- Fixed dependencies in one missed entry point
- Some other minor fixes and optimizations

### [3.17.1 - 2021.09.02](https://github.com/zloirock/core-js/releases/tag/v3.17.1)
- Fixed missed `modules-by-versions` data

### [3.17.0 - 2021.09.02](https://github.com/zloirock/core-js/releases/tag/v3.17.0)
- [Accessible `Object.prototype.hasOwnProperty` (`Object.hasOwn`) proposal](https://github.com/tc39/proposal-accessible-object-hasownproperty) moved to the stable ES, [per August 2021 TC39 meeting](https://github.com/babel/proposals/issues/76#issuecomment-909288348)
- [Relative indexing method (`.at`) proposal](https://github.com/tc39/proposal-relative-indexing-method) moved to the stable ES, [per August 2021 TC39 meeting](https://github.com/babel/proposals/issues/76#issuecomment-909285053)
- Exposed by default the stable version of `String.prototype.at`. It was not exposed because of the conflict with the alternative obsolete proposal (that will be completely removed in the next major version). For the backward compatibility, in the case of loading this proposal, it will be overwritten.
- Some more iteration closing fixes
- Fixed an ES3 reserved words usage, [#980](https://github.com/zloirock/core-js/issues/980)

### [3.16.4 - 2021.08.29](https://github.com/zloirock/core-js/releases/tag/v3.16.4)
- `AsyncFromSyncIterator` made stricter, related mainly to `AsyncIterator.from` and `AsyncIterator.prototype.flatMap`
- Handling of optional `.next` arguments in `(Async)Iterator` methods is aligned with the current spec draft (mainly - ignoring the first passed to `.next` argument in built-in generators)
- Behavior of `.next`, `.return`, `.throw` methods on `AsyncIterator` helpers proxy iterators aligned with the current spec draft (built-in async generators) (mainly - some early errors moved to returned promises)
- Fixed some cases of safe iteration closing
- Fixed dependencies of some entry points

### [3.16.3 - 2021.08.25](https://github.com/zloirock/core-js/releases/tag/v3.16.3)
- Fixed `CreateAsyncFromSyncIterator` semantic in `AsyncIterator.from`, related to [#765](https://github.com/zloirock/core-js/issues/765)
- Added a workaround of a specific case of broken `Object.prototype`, [#973](https://github.com/zloirock/core-js/issues/973)

### [3.16.2 - 2021.08.17](https://github.com/zloirock/core-js/releases/tag/v3.16.2)
- Added a workaround of a Closure Compiler unsafe optimization, [#972](https://github.com/zloirock/core-js/issues/972)
- One more fix crashing of `Object.create(null)` on WSH, [#970](https://github.com/zloirock/core-js/issues/970)
- Added Deno 1.14 compat data mapping

### [3.16.1 - 2021.08.09](https://github.com/zloirock/core-js/releases/tag/v3.16.1)
- Fixed microtask implementation on iOS Pebble, [#967](https://github.com/zloirock/core-js/issues/967)
- Fixed some entry points
- Improved old Safari compat data

### [3.16.0 - 2021.07.30](https://github.com/zloirock/core-js/releases/tag/v3.16.0)
- [`Array` find from last proposal](https://github.com/tc39/proposal-array-find-from-last) moved to the stage 3, [July 2021 TC39 meeting](https://github.com/tc39/proposal-array-find-from-last/pull/47)
- [`Array` filtering stage 1 proposal](https://github.com/tc39/proposal-array-filtering):
  - `Array.prototype.filterReject` replaces `Array.prototype.filterOut`
  - `%TypedArray%.prototype.filterReject` replaces `%TypedArray%.prototype.filterOut`
- Added [`Array` grouping stage 1 proposal](https://github.com/tc39/proposal-array-grouping):
  - `Array.prototype.groupBy`
  - `%TypedArray%.prototype.groupBy`
- Work with symbols made stricter: some missed before cases of methods that should throw an error on symbols now works as they should
- Handling `@@toPrimitive` in some cases of `ToPrimitive` internal logic made stricter
- Fixed work of `Request` with polyfilled `URLSearchParams`, [#965](https://github.com/zloirock/core-js/issues/965)
- Fixed possible exposing of collections elements metadata in some cases, [#427](https://github.com/zloirock/core-js/issues/427)
- Fixed crashing of `Object.create(null)` on WSH, [#966](https://github.com/zloirock/core-js/issues/966)
- Fixed some cases of typed arrays subclassing logic
- Fixed a minor bug related to string conversion in `RegExp#exec`
- Fixed `Date.prototype.getYear` feature detection
- Fixed content of some entry points
- Some minor optimizations and refactoring
- Deno:
  - Added Deno support (sure, after bundling since Deno does not support CommonJS)
  - Allowed `deno` target in `core-js-compat` / `core-js-builder`
  - A bundle for Deno published on [deno.land/x/corejs](https://deno.land/x/corejs)
- Added / updated compat data / mapping:
  - Deno 1.0-1.13
  - NodeJS up to 16.6
  - iOS Safari up to 15.0
  - Samsung Internet up to 15.0
  - Opera Android up to 64
  - `Object.hasOwn` marked as supported from [V8 9.3](https://chromestatus.com/feature/5662263404920832) and [FF92](https://bugzilla.mozilla.org/show_bug.cgi?id=1721149)
  - `Date.prototype.getYear` marked as not supported in IE8-
- Added `summary` option to `core-js-builder`, see more info in the [`README`](https://github.com/zloirock/core-js/blob/master/packages/core-js-builder/README.md), [#910](https://github.com/zloirock/core-js/issues/910)

### [3.15.2 - 2021.06.29](https://github.com/zloirock/core-js/releases/tag/v3.15.2)
- Worked around breakage related to `zone.js` loaded before `core-js`, [#953](https://github.com/zloirock/core-js/issues/953)
- Added NodeJS 16.4 -> Chrome 91 compat data mapping

### [3.15.1 - 2021.06.23](https://github.com/zloirock/core-js/releases/tag/v3.15.1)
- Fixed cloning of regex through `RegExp` constructor, [#948](https://github.com/zloirock/core-js/issues/948)

### [3.15.0 - 2021.06.21](https://github.com/zloirock/core-js/releases/tag/v3.15.0)
- Added `RegExp` named capture groups polyfill, [#521](https://github.com/zloirock/core-js/issues/521), [#944](https://github.com/zloirock/core-js/issues/944)
- Added `RegExp` `dotAll` flag polyfill, [#792](https://github.com/zloirock/core-js/issues/792), [#944](https://github.com/zloirock/core-js/issues/944)
- Added missed polyfills of [Annex B](https://tc39.es/ecma262/#sec-additional-built-in-properties) features (required mainly for some non-browser engines), [#336](https://github.com/zloirock/core-js/issues/336), [#945](https://github.com/zloirock/core-js/issues/945):
  - `escape`
  - `unescape`
  - `String.prototype.substr`
  - `Date.prototype.getYear`
  - `Date.prototype.setYear`
  - `Date.prototype.toGMTString`
- Fixed detection of forbidden host code points in `URL` polyfill
- Allowed `rhino` target in `core-js-compat` / `core-js-builder`, added compat data for `rhino` 1.7.13, [#942](https://github.com/zloirock/core-js/issues/942), thanks [@gausie](https://github.com/gausie)
- `.at` marked as supported from FF90

### [3.14.0 - 2021.06.05](https://github.com/zloirock/core-js/releases/tag/v3.14.0)
- Added polyfill of stable sort in `{ Array, %TypedArray% }.prototype.sort`, [#769](https://github.com/zloirock/core-js/issues/769), [#941](https://github.com/zloirock/core-js/issues/941)
- Fixed `Safari` 14.0- `%TypedArray%.prototype.sort` validation of arguments bug
- `.at` marked as supported from V8 9.2

### [3.13.1 - 2021.05.29](https://github.com/zloirock/core-js/releases/tag/v3.13.1)
- Overwrites `get-own-property-symbols` third-party `Symbol` polyfill if it's used since it causes a stack overflow, [#774](https://github.com/zloirock/core-js/issues/774)
- Added a workaround of possible browser crash on `Object.prototype` accessors methods in WebKit ~ Android 4.0, [#232](https://github.com/zloirock/core-js/issues/232)

### [3.13.0 - 2021.05.26](https://github.com/zloirock/core-js/releases/tag/v3.13.0)
- Accessible `Object#hasOwnProperty` (`Object.hasOwn`) proposal moved to the stage 3, [May 2021 TC39 meeting](https://github.com/babel/proposals/issues/74#issuecomment-848121673)

### [3.12.1 - 2021.05.09](https://github.com/zloirock/core-js/releases/tag/v3.12.1)
- Fixed some cases of `Function#toString` with multiple `core-js` instances
- Fixed some possible `String#split` polyfill problems in V8 5.1

### [3.12.0 - 2021.05.06](https://github.com/zloirock/core-js/releases/tag/v3.12.0)
- Added well-known symbol `Symbol.metadata` for [decorators stage 2 proposal](https://github.com/tc39/proposal-decorators)
- Added well-known symbol `Symbol.matcher` for [pattern matching stage 1 proposal](https://github.com/tc39/proposal-pattern-matching)
- Fixed regression of V8 ~ Node 0.12 `String(Symbol())` bug, [#933](https://github.com/zloirock/core-js/issues/933)

### [3.11.3 - 2021.05.05](https://github.com/zloirock/core-js/releases/tag/v3.11.3)
- Native promise-based APIs `Promise#{ catch, finally }` returns polyfilled `Promise` instances when it's required

### [3.11.2 - 2021.05.03](https://github.com/zloirock/core-js/releases/tag/v3.11.2)
- Added a workaround of WebKit ~ iOS 10.3 Safari `Promise` bug, [#932](https://github.com/zloirock/core-js/issues/932)
- `Promise#then` of incorrect native `Promise` implementations with correct subclassing no longer wrapped
- Changed the order of `Promise` feature detection, removed unhandled rejection tracking check in non-browser non-node platforms

### [3.11.1 - 2021.04.28](https://github.com/zloirock/core-js/releases/tag/v3.11.1)
- Made `instanceof Promise` and `.constructor === Promise` work with polyfilled `Promise` for all native promise-based APIs
- Added a workaround for some buggy V8 versions \~4.5 related to fixing of `%TypedArray%` static methods, [#564](https://github.com/zloirock/core-js/issues/564)

### [3.11.0 - 2021.04.22](https://github.com/zloirock/core-js/releases/tag/v3.11.0)
- Added [accessible `Object#hasOwnProperty` stage 2 proposal](https://github.com/tc39/proposal-accessible-object-hasownproperty)
  - `Object.hasOwn` method
- Fixed a possible `RegExp` constructor problem with multiple global `core-js` instances

### [3.10.2 - 2021.04.19](https://github.com/zloirock/core-js/releases/tag/v3.10.2)
- `URL` and `URLSearchParams` marked as supported from Safari 14.0
- Polyfilled built-in constructors protected from calling on instances

### [3.10.1 - 2021.04.08](https://github.com/zloirock/core-js/releases/tag/v3.10.1)
- Prevented possible `RegExp#split` problems in old engines, [#751](https://github.com/zloirock/core-js/issues/751), [#919](https://github.com/zloirock/core-js/issues/919)
- Detection of Safari 10 string padding bug extended to some Safari-based browsers

### [3.10.0 - 2021.03.31](https://github.com/zloirock/core-js/releases/tag/v3.10.0)
- [`Array` find from last proposal](https://github.com/tc39/proposal-array-find-from-last) moved to the stage 2, [March TC39 meeting](https://github.com/babel/proposals/issues/71#issuecomment-795916535)
- Prevented possible `RegExp#exec` problems in some old engines, [#920](https://github.com/zloirock/core-js/issues/920)
- Updated compat data mapping:
  - NodeJS up to 16.0
  - Electron up to 13.0
  - Samsung Internet up to 14.0
  - Opera Android up to 62
  - The rest automatically

### [3.9.1 - 2021.03.01](https://github.com/zloirock/core-js/releases/tag/v3.9.1)
- Added a workaround for Chrome 38-40 bug which does not allow to inherit symbols (incl. well-known) from DOM collections prototypes to instances, [#37](https://github.com/zloirock/core-js/issues/37)
- Used `NumericRangeIterator` as toStringTag instead of `RangeIterator` in `{ Number, BigInt }.range` iterator, per [this PR](https://github.com/tc39/proposal-Number.range/pull/46)
- TypedArray constructors marked as supported from Safari 14.0
- Updated compat data mapping for iOS Safari and Opera for Android

### [3.9.0 - 2021.02.19](https://github.com/zloirock/core-js/releases/tag/v3.9.0)
- Added [`Array` find from last stage 1 proposal](https://github.com/tc39/proposal-array-find-from-last)
  - `Array#findLast`
  - `Array#findLastIndex`
  - `%TypedArray%#findLast`
  - `%TypedArray%#findLastIndex`
- Added `%TypedArray%#uniqueBy` method for [array deduplication stage 1 proposal](https://github.com/tc39/proposal-array-unique)
  - `%TypedArray%#uniqueBy`
- Dropped `ToLength` detection from array methods feature detection which could cause hanging FF11-21 and some versions of old WebKit, [#764](https://github.com/zloirock/core-js/issues/764)
- Minified bundle from `core-js-bundle` uses `terser` instead of `uglify-js`

### [3.8.3 - 2021.01.19](https://github.com/zloirock/core-js/releases/tag/v3.8.3)
- Fixed some more issues related to FF44- legacy `Iterator`, [#906](https://github.com/zloirock/core-js/issues/906)

### [3.8.2 - 2021.01.03](https://github.com/zloirock/core-js/releases/tag/v3.8.2)
- Fixed handling of special replacements patterns in `String#replaceAll`, [#900](https://github.com/zloirock/core-js/issues/900)
- Fixed iterators dependencies of `Promise.any` and `Promise.allSettled` entries
- Fixed microtask implementation on WebOS, [#898](https://github.com/zloirock/core-js/issues/898), [#901](https://github.com/zloirock/core-js/issues/901)

### [3.8.1 - 2020.12.06](https://github.com/zloirock/core-js/releases/tag/v3.8.1)
- Fixed work of new `%TypedArray%` methods on `BigInt` arrays
- Added ESNext methods to ES3 workaround for `Number` constructor wrapper

### [3.8.0 - 2020.11.26](https://github.com/zloirock/core-js/releases/tag/v3.8.0)
- Added [relative indexing method stage 3 proposal](https://github.com/tc39/proposal-relative-indexing-method)
  - `Array#at`
  - `%TypedArray%#at`
- Added [`Number.range` stage 1 proposal](https://github.com/tc39/proposal-Number.range)
  - `Number.range`
  - `BigInt.range`
- Added [array filtering stage 1 proposal](https://github.com/tc39/proposal-array-filtering)
  - `Array#filterOut`
  - `%TypedArray%#filterOut`
- Added [array deduplication stage 1 proposal](https://github.com/tc39/proposal-array-unique)
  - `Array#uniqueBy`
- Added code points / code units explicit feature detection in `String#at` for preventing breakage code which use obsolete `String#at` proposal polyfill
- Added the missed `(es|stable)/instance/replace-all` entries
- Updated compat data mapping for Opera - from Opera 69, the difference with Chrome versions increased to 14
- Compat data mapping for modern Android WebView to Chrome moved from targets parser directly to compat data
- Deprecate `core-js-builder` `blacklist` option in favor of `exclude`

### [2.6.12 [LEGACY] - 2020.11.26](https://github.com/zloirock/core-js/releases/tag/v2.6.12)
- Added code points / code units explicit feature detection in `String#at` for preventing breakage code which use obsolete `String#at` proposal polyfill
- Added `OPEN_SOURCE_CONTRIBUTOR` detection in `postinstall`
- Added Drone CI detection in `postinstall`

### [3.7.0 - 2020.11.06](https://github.com/zloirock/core-js/releases/tag/v3.7.0)
- `String#replaceAll` moved to the stable ES, [per June TC39 meeting](https://github.com/tc39/notes/blob/master/meetings/2020-06/june-2.md#stringprototypereplaceall-for-stage-4)
- `Promise.any` and `AggregateError` moved to the stable ES, [per July TC39 meeting](https://github.com/tc39/notes/blob/master/meetings/2020-07/july-21.md#promiseany--aggregateerror-for-stage-4)
- Added `Reflect[@@toStringTag]`, [per July TC39 meeting](https://github.com/tc39/ecma262/pull/2057)
- Forced replacement of `Array#{ reduce, reduceRight }` in Chrome 80-82 because of [a bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1049982), [#766](https://github.com/zloirock/core-js/issues/766)
- Following the changes in [the `upsert` proposal](https://github.com/tc39/proposal-upsert), `{ Map, WeakMap }#emplace` replace `{ Map, WeakMap }#upsert`, these obsolete methods will be removed in the next major release
- [By the current spec](https://tc39.es/ecma262/#sec-aggregate-error-constructor), `AggregateError#errors` is own data property
- Added correct iteration closing in the iteration helpers according to the current version of [the proposal](https://tc39.es/proposal-iterator-helpers)
- `process.nextTick` have a less priority than `Promise` in the microtask implementation, [#855](https://github.com/zloirock/core-js/issues/855)
- Fixed microtask implementation in engines with `MutationObserver`, but without `document`, [#865](https://github.com/zloirock/core-js/issues/865), [#866](https://github.com/zloirock/core-js/issues/866)
- Fixed `core-js-builder` with an empty (after the targets engines or another filtration) modules list, [#822](https://github.com/zloirock/core-js/issues/822)
- Fixed possible twice call of `window.onunhandledrejection`, [#760](https://github.com/zloirock/core-js/issues/760)
- Fixed some possible problems related multiple global copies of `core-js`, [#880](https://github.com/zloirock/core-js/issues/880)
- Added a workaround for 3rd party `Reflect.set` polyfill bug, [#847](https://github.com/zloirock/core-js/issues/847)
- Updated compat data:
  - Chrome up to 86
  - FF up to 82
  - Safari up to 14
- Updated compat data mapping:
  - iOS up to 14
  - NodeJS up to 15.0
  - Electron up to 11.0
  - Samsung Internet up to 13.0
  - Opera Android up to 60
  - The rest automatically
- Updated all required dependencies

### [3.6.5 - 2020.04.09](https://github.com/zloirock/core-js/releases/tag/v3.6.5)
- Updated Browserslist [#755](https://github.com/zloirock/core-js/issues/755)
- Fixed `setImmediate` in Safari [#770](https://github.com/zloirock/core-js/issues/770), thanks [@dtinth](https://github.com/dtinth)
- Fixed some regexp, thanks [@scottarc](https://github.com/scottarc)
- Added OPEN_SOURCE_CONTRIBUTOR detection in `postinstall`, thanks [@scottarc](https://github.com/scottarc)
- Added Drone CI in `postinstall` CI detection [#781](https://github.com/zloirock/core-js/issues/781)

### [3.6.4 - 2020.01.14](https://github.com/zloirock/core-js/releases/tag/v3.6.4)
- Prevented a possible almost infinite loop in non-standard implementations of some backward iteration array methods

### [3.6.3 - 2020.01.11](https://github.com/zloirock/core-js/releases/tag/v3.6.3)
- Fixed replacement of substitutes of undefined capture groups in `.replace` in Safari 13.0-, [#471](https://github.com/zloirock/core-js/issues/471), [#745](https://github.com/zloirock/core-js/issues/745), thanks [@mattclough1](https://github.com/mattclough1)
- Improved compat data for old engines

### [3.6.2 - 2020.01.07](https://github.com/zloirock/core-js/releases/tag/v3.6.2)
- Fixed early implementations of `Array#{ every, forEach, includes, indexOf, lastIndexOf, reduce, reduceRight, slice, some, splice }` for the usage of `ToLength`
- Added `RegExp#exec` dependency to methods which depends on the correctness of logic of this method (`3.6.0-3.6.1` issue), [#741](https://github.com/zloirock/core-js/issues/741)
- Refactored some internals

### [3.6.1 - 2019.12.25](https://github.com/zloirock/core-js/releases/tag/v3.6.1)
- Fixed a bug related `Symbol` with multiple copies of `core-js` (for `3.4.2-3.6.0`), [#736](https://github.com/zloirock/core-js/issues/736)
- Refactored some tools

### [3.6.0 - 2019.12.19](https://github.com/zloirock/core-js/releases/tag/v3.6.0)
- Added support of sticky (`y`) `RegExp` flag, [#372](https://github.com/zloirock/core-js/issues/372), [#732](https://github.com/zloirock/core-js/issues/732), [#492](https://github.com/zloirock/core-js/issues/492), thanks [@cvle](https://github.com/cvle) and [@nicolo-ribaudo](https://github.com/nicolo-ribaudo)
- Added `RegExp#test` delegation to `RegExp#exec`, [#732](https://github.com/zloirock/core-js/issues/732), thanks [@cvle](https://github.com/cvle)
- Fixed some cases of `Object.create(null)` in IE8-, [#727](https://github.com/zloirock/core-js/issues/727), [#728](https://github.com/zloirock/core-js/issues/728), thanks [@aleen42](https://github.com/aleen42)
- Allowed object of minimum environment versions as `core-js-compat` and `core-js-builder` `targets` argument
- Allowed corresponding to Babel `targets.esmodules`, `targets.browsers`, `targets.node` options in `core-js-compat` and `core-js-builder`
- Engines in compat data and results of targets parsing sorted alphabetically
- Fixed `features/instance/match-all` entry compat data
- Fixed `Array.prototype[@@unscopables]` descriptor (was writable)
- Added Samsung Internet 11 compat data mapping

### [3.5.0 - 2019.12.12](https://github.com/zloirock/core-js/releases/tag/v3.5.0)
- Added [object iteratoration stage 1 proposal](https://github.com/tc39/proposal-object-iteration):
  - `Object.iterateKeys`
  - `Object.iterateValues`
  - `Object.iterateEntries`

### [3.4.8 - 2019.12.09](https://github.com/zloirock/core-js/releases/tag/v3.4.8)
- Added one more workaround for broken in previous versions `inspectSource` helper, [#719](https://github.com/zloirock/core-js/issues/719)
- Added Opera Mobile compat data
- Updated Samsung Internet, iOS, old Node and Android compat data mapping
- `es.string.match-all` marked as completely supported in FF73
- Generate `core-js-compat/modules` since often we need just the list of `core-js` modules

### [2.6.11 [LEGACY] - 2019.12.09](https://github.com/zloirock/core-js/releases/tag/v2.6.11)
- Returned usage of `node -e` in the `postinstall` scripts for better cross-platform compatibility, [#582](https://github.com/zloirock/core-js/issues/582)
- Improved CI detection in the `postinstall` script, [#707](https://github.com/zloirock/core-js/issues/707)

### [3.4.7 - 2019.12.03](https://github.com/zloirock/core-js/releases/tag/v3.4.7)
- Fixed an NPM publishing issue

### [3.4.6 - 2019.12.03](https://github.com/zloirock/core-js/releases/tag/v3.4.6)
- Improved iOS compat data - added missed mapping iOS 12.2 -> Safari 12.1, added bug fixes from patch releases
- Added Safari 13.1 compat data
- Added missed in `core-js-compat` helpers `ie_mob` normalization
- Normalize the result of `getModulesListForTargetVersion` `core-js-compat` helper
- Improved CI detection in the `postinstall` script, [#707](https://github.com/zloirock/core-js/issues/707)

### [3.4.5 - 2019.11.28](https://github.com/zloirock/core-js/releases/tag/v3.4.5)
- Detect incorrect order of operations in `Object.assign`, MS Edge bug
- Detect usage of `ToLength` in `Array#{ filter, map }`, FF48-49 and MS Edge 14- issues
- Detect incorrect MS Edge 17-18 `Reflect.set` which allows setting the property to object with non-writable property on the prototype
- Fixed `inspectSource` helper with multiple `core-js` copies and some related features like some edge cases of `Promise` feature detection

### [3.4.4 - 2019.11.27](https://github.com/zloirock/core-js/releases/tag/v3.4.4)
- Added feature detection for Safari [non-generic `Promise#finally` bug](https://bugs.webkit.org/show_bug.cgi?id=200829) **(critical for `core-js-pure`)**
- Fixed missed `esnext.string.code-points` in `core-js/features/string` entry point
- Updated `Iterator` proposal feature detection for the case of non-standard `Iterator` in FF44-

### [3.4.3 - 2019.11.26](https://github.com/zloirock/core-js/releases/tag/v3.4.3)
- Fixed missed `es.json.stringify` and some modules from iteration helpers proposal in some entry points **(includes the root entry point)**
- Added a workaround of `String#{ endsWith, startsWith }` MDN polyfills bugs, [#702](https://github.com/zloirock/core-js/issues/702)
- Fixed `.size` property descriptor of `Map` / `Set` in the pure version
- Refactoring, some internal improvements

### [3.4.2 - 2019.11.22](https://github.com/zloirock/core-js/releases/tag/v3.4.2)
- Don't use polyfilled symbols as internal uids, a workaround for some incorrect use cases
- `String#replaceAll` is available only in nightly FF builds
- Improved `Promise` feature detection for the case of V8 6.6 with multiple `core-js` copies
- Some internals optimizations
- Added Node 13.2 -> V8 7.9 compat data mapping
- Returned usage of `node -e` in `postinstall` scripts

### [3.4.1 - 2019.11.12](https://github.com/zloirock/core-js/releases/tag/v3.4.1)
- Throw when `(Async)Iterator#flatMap` mapper returns a non-iterable, per [tc39/proposal-iterator-helpers/55](https://github.com/tc39/proposal-iterator-helpers/issues/55) and [tc39/proposal-iterator-helpers/59](https://github.com/tc39/proposal-iterator-helpers/pull/59)
- Removed own `AggregateError#toString`, per [tc39/proposal-promise-any/49](https://github.com/tc39/proposal-promise-any/pull/49)
- Global `core-js` `Promise` polyfill passes feature detection in the pure versions
- Fixed indexes in `String#replaceAll` callbacks
- `String#replaceAll` marked as supported by FF72

### [3.4.0 - 2019.11.07](https://github.com/zloirock/core-js/releases/tag/v3.4.0)
- Added [well-formed `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify), ES2019 feature, thanks [@ExE-Boss](https://github.com/ExE-Boss) and [@WebReflection](https://github.com/WebReflection) for the idea
- Fixed `Math.signbit`, [#687](https://github.com/zloirock/core-js/issues/687), thanks [@chicoxyzzy](https://github.com/chicoxyzzy)

### [3.3.6 - 2019.11.01](https://github.com/zloirock/core-js/releases/tag/v3.3.6)
- Don't detect Chakra-based Edge as Chrome in the `userAgent` parsing
- Fixed inheritance in typed array constructors wrappers, [#683](https://github.com/zloirock/core-js/issues/683)
- Added one more workaround for correct work of early `fetch` implementations with polyfilled `URLSearchParams`, [#680](https://github.com/zloirock/core-js/issues/680)

### [3.3.5 - 2019.10.29](https://github.com/zloirock/core-js/releases/tag/v3.3.5)
- Added a workaround of V8 deoptimization which causes serious performance degradation (~4x in my tests) of `Array#concat`, [#679](https://github.com/zloirock/core-js/issues/679)
- Added a workaround of V8 deoptimization which causes slightly performance degradation of `Promise`, [#679](https://github.com/zloirock/core-js/issues/679)
- Added `(Async)Iterator.prototype.constructor -> (Async)Iterator` per [this issue](https://github.com/tc39/proposal-iterator-helpers/issues/60)
- Added compat data for Chromium-based Edge

### [3.3.4 - 2019.10.25](https://github.com/zloirock/core-js/releases/tag/v3.3.4)
- Added a workaround of V8 deoptimization which causes serious performance degradation (~20x in my tests) of some `RegExp`-related methods like `String#split`, [#306](https://github.com/zloirock/core-js/issues/306)
- Added a workaround of V8 deoptimization which causes serious performance degradation (up to 100x in my tests) of `Array#splice` and slightly `Array#{ filter, map }`, [#677](https://github.com/zloirock/core-js/issues/677)
- Fixed work of `fetch` with polyfilled `URLSearchParams`, [#674](https://github.com/zloirock/core-js/issues/674)
- Fixed an edge case of `String#replaceAll` with an empty search value
- Added compat data for Chrome 80
- `package-lock.json` no longer generated in libraries

### [3.3.3 - 2019.10.22](https://github.com/zloirock/core-js/releases/tag/v3.3.3)
- `gopher` removed from `URL` special cases per [this issue](https://github.com/whatwg/url/issues/342) and [this PR](https://github.com/whatwg/url/pull/453)
- Added compat data for iOS 13 and Node 13.0

### [3.3.2 - 2019.10.14](https://github.com/zloirock/core-js/releases/tag/v3.3.2)
- Fixed compatibility of `core-js-compat` with Node 6 and Yarn, [#669](https://github.com/zloirock/core-js/issues/669)

### [3.3.1 - 2019.10.13](https://github.com/zloirock/core-js/releases/tag/v3.3.1)
- Fixed an NPM publishing issue

### [3.3.0 - 2019.10.13](https://github.com/zloirock/core-js/releases/tag/v3.3.0)
- **`String#{ matchAll, replaceAll }` throws an error on non-global regex argument per [the decision from TC39 meetings](https://github.com/tc39/ecma262/pull/1716) (+ [this PR](https://github.com/tc39/proposal-string-replaceall/pull/24)). It's a breaking change, but since it's a breaking change in the ES spec, it's added at the minor release**
- `globalThis` moved to stable ES, [per October TC39 meeting](https://github.com/babel/proposals/issues/60#issuecomment-537217903)
- `Promise.any` moved to stage 3, some minor internal changes, [per October TC39 meeting](https://github.com/babel/proposals/issues/60#issuecomment-538084885)
- `String#replaceAll` moved to stage 3, [per October TC39 meeting](https://github.com/babel/proposals/issues/60#issuecomment-537530013)
- Added [iterator helpers stage 2 proposal](https://github.com/tc39/proposal-iterator-helpers):
  - `Iterator`
    - `Iterator.from`
    - `Iterator#asIndexedPairs`
    - `Iterator#drop`
    - `Iterator#every`
    - `Iterator#filter`
    - `Iterator#find`
    - `Iterator#flatMap`
    - `Iterator#forEach`
    - `Iterator#map`
    - `Iterator#reduce`
    - `Iterator#some`
    - `Iterator#take`
    - `Iterator#toArray`
    - `Iterator#@@toStringTag`
  - `AsyncIterator`
    - `AsyncIterator.from`
    - `AsyncIterator#asIndexedPairs`
    - `AsyncIterator#drop`
    - `AsyncIterator#every`
    - `AsyncIterator#filter`
    - `AsyncIterator#find`
    - `AsyncIterator#flatMap`
    - `AsyncIterator#forEach`
    - `AsyncIterator#map`
    - `AsyncIterator#reduce`
    - `AsyncIterator#some`
    - `AsyncIterator#take`
    - `AsyncIterator#toArray`
    - `AsyncIterator#@@toStringTag`
- Updated `Map#upsert` (`Map#updateOrInsert` before) [proposal](https://github.com/thumbsupep/proposal-upsert)
  - Moved to stage 2, [per October TC39 meeting](https://github.com/babel/proposals/issues/60#issuecomment-537606117)
  - `Map#updateOrInsert` renamed to `Map#upsert`
  - Added `WeakMap#upsert`
  - You can don't pass one of the callbacks
- Added a workaround for iOS Safari MessageChannel + bfcache bug, [#624](https://github.com/zloirock/core-js/issues/624)
- Added a workaround for Chrome 33 / Android 4.4.4 `Promise` bug, [#640](https://github.com/zloirock/core-js/issues/640)
- Replaced broken `URL` constructor in Safari and `URLSearchParams` in Chrome 66-, [#656](https://github.com/zloirock/core-js/issues/656)
- Added compat data for Node up to 12.11, FF 69, Samsung up to 10.2 and Phantom 1.9
- `Math.hypot` marked as not supported in Chrome 77 since [a bug in this method](https://bugs.chromium.org/p/v8/issues/detail?id=9546) was not fixed before the stable Chrome 77 release
- Fixed unnecessary exposing on `Symbol.matchAll` in `esnext.string.match-all`, [#626](https://github.com/zloirock/core-js/issues/626)
- Fixed missed cases [access the `.next` method once, at the beginning, of the iteration protocol](https://github.com/tc39/ecma262/issues/976)
- Show similar `postinstall` messages only once per `npm i`, [#597](https://github.com/zloirock/core-js/issues/597), thanks [@remy](https://github.com/remy)

### [2.6.10 [LEGACY] - 2019.10.13](https://github.com/zloirock/core-js/releases/tag/v2.6.10)
- Show similar `postinstall` messages only once per `npm i`, [#597](https://github.com/zloirock/core-js/issues/597)

### [3.2.1 - 2019.08.12](https://github.com/zloirock/core-js/releases/tag/v3.2.1)
- Added a workaround for possible recursion in microtasks caused by conflicts with other `Promise` polyfills, [#615](https://github.com/zloirock/core-js/issues/615)

### [3.2.0 - 2019.08.09](https://github.com/zloirock/core-js/releases/tag/v3.2.0)
- `Promise.allSettled` moved to stable ES, per July TC39 meeting
- `Promise.any` moved to stage 2, `.errors` property of `AggregateError` instances made non-enumerable, per July TC39 meeting
- `using` statement proposal moved to stage 2, added `Symbol.asyncDispose`, per July TC39 meeting
- Added `Array.isTemplateObject` [stage 2 proposal](https://github.com/tc39/proposal-array-is-template-object), per June TC39 meeting
- Added `Map#updateOrInsert` [stage 1 proposal](https://docs.google.com/presentation/d/1_xtrGSoN1-l2Q74eCXPHBbbrBHsVyqArWN0ebnW-pVQ/), per July TC39 meeting
- Added a fix for [`Math.hypot` V8 7.7 bug](https://bugs.chromium.org/p/v8/issues/detail?id=9546), since it's still not stable without adding results to `core-js-compat`
- Added a workaround for APIs where not possible to replace broken native `Promise`, [#579](https://github.com/zloirock/core-js/issues/579) - added `.finally` and patched `.then` to / on native `Promise` prototype
- Fixed crashing of Opera Presto, [#595](https://github.com/zloirock/core-js/issues/595)
- Fixed incorrect early breaking of `{ Map, Set, WeakMap, WeakSet }.deleteAll`
- Fixed some missed dependencies in entry points
- Added compat data for Node 12.5, FF 67, Safari 13
- Added support of `DISABLE_OPENCOLLECTIVE` env variable to `postinstall` script
- Removed `core-js-pure` dependency from `core-js-compat`, [#590](https://github.com/zloirock/core-js/issues/590)
- Fixed generation of `core-js-compat` on Windows, [#606](https://github.com/zloirock/core-js/issues/606)

### [3.1.4 - 2019.06.15](https://github.com/zloirock/core-js/releases/tag/v3.1.4)
- Refactoring. Many minor internal improvements and fixes like:
  - Improved `Symbol.keyFor` complexity to `O(1)`
  - Fixed the order of arguments validation in `String.prototype.{ endsWith, includes, startsWith }`
  - Internal implementation of `RegExp#flags` helper now respect `dotAll` flag (mainly related to the `pure` version)
  - Performance optimizations related old V8
  - Etc.

### [3.1.3 - 2019.05.27](https://github.com/zloirock/core-js/releases/tag/v3.1.3)
- Fixed `core-js/features/reflect/delete-metadata` entry point
- Some fixes and improvements of the `postinstall` script like support `npm` color config ([#556](https://github.com/zloirock/core-js/issues/556)) or adding support of `ADBLOCK` env variable
- Refactoring and some minor fixes

### [2.6.9 [LEGACY] - 2019.05.27](https://github.com/zloirock/core-js/releases/tag/v2.6.9)
- Some fixes and improvements of the `postinstall` script like support `npm` color config ([#556](https://github.com/zloirock/core-js/issues/556)) or adding support of `ADBLOCK` env variable

### [3.1.2 - 2019.05.22](https://github.com/zloirock/core-js/releases/tag/v3.1.2)
- Added a workaround of a strange `npx` bug on `postinstall`, [#551](https://github.com/zloirock/core-js/issues/551)

### [2.6.8 [LEGACY] - 2019.05.22](https://github.com/zloirock/core-js/releases/tag/v2.6.8)
- Added a workaround of a strange `npx` bug on `postinstall`, [#551](https://github.com/zloirock/core-js/issues/551)

### [3.1.1 - 2019.05.21](https://github.com/zloirock/core-js/releases/tag/v3.1.1)
- Added one more workaround of alternative not completely correct `Symbol` polyfills, [#550](https://github.com/zloirock/core-js/issues/550), [#554](https://github.com/zloirock/core-js/issues/554)
- Reverted `esnext.string.match-all` in some entry points for fix autogeneration of `core-js-compat/entries` and backward `@babel/preset-env` compatibility

### [2.6.7 [LEGACY] - 2019.05.21](https://github.com/zloirock/core-js/releases/tag/v2.6.7)
- Added one more workaround of alternative not completely correct `Symbol` polyfills, [#550](https://github.com/zloirock/core-js/issues/550), [#554](https://github.com/zloirock/core-js/issues/554)

### [3.1.0 - 2019.05.20](https://github.com/zloirock/core-js/releases/tag/v3.1.0)
- `String#matchAll` moved to stable ES, exposed `Symbol.matchAll`, [#516](https://github.com/zloirock/core-js/issues/516)
- `Promise.allSettled` moved to stage 3, [#515](https://github.com/zloirock/core-js/issues/515)
- `String#replaceAll` moved to stage 2, behavior updated by the spec draft, [#524](https://github.com/zloirock/core-js/issues/524)
- `Promise.any` moved to stage 1, [#517](https://github.com/zloirock/core-js/issues/517)
- Removed `es.regexp.flags` dependency from `es.regexp.to-string`, [#536](https://github.com/zloirock/core-js/issues/536), [#537](https://github.com/zloirock/core-js/issues/537)
- Fixed IE8- non-enumerable properties support in `Object.{ assign, entries, values }`, [#541](https://github.com/zloirock/core-js/issues/541)
- Fixed support of primitives in `Object.getOwnPropertySymbols` in Chrome 38 / 39, [#539](https://github.com/zloirock/core-js/issues/539)
- `window.postMessage`-based task implementation uses location origin over `'*'`, [#542](https://github.com/zloirock/core-js/issues/542)
- Lookup `PromiseConstructor.resolve` only once in `Promise` combinators, [tc39/ecma262#1506](https://github.com/tc39/ecma262/pull/1506)
- Temporarily removed `core-js` dependency from `core-js-compat` since it's required for missed at this moment feature
- Show a message on `postinstall`
- Added compat data for Chrome 76, FF 67, Node 12

### [2.6.6 [LEGACY] - 2019.05.20](https://github.com/zloirock/core-js/releases/tag/v2.6.6)
- Fixed IE8- non-enumerable properties support in `Object.{ assign, entries, values }`, [#541](https://github.com/zloirock/core-js/issues/541)
- Fixed support of primitives in `Object.getOwnPropertySymbols` in Chrome 38 / 39, [#539](https://github.com/zloirock/core-js/issues/539)
- Show a message on `postinstall`

### [3.0.1 - 2019.04.06](https://github.com/zloirock/core-js/releases/tag/v3.0.1)
- Fixed some cases of work with malformed URI sequences in `URLSearchParams`, [#525](https://github.com/zloirock/core-js/issues/525)
- Added a workaround for a rollup issue, [#513](https://github.com/zloirock/core-js/issues/513)

### [3.0.0 - 2019.03.19](https://github.com/zloirock/core-js/releases/tag/v3.0.0)
- Features
  - Add new features:
    - `Object.fromEntries` ([ECMAScript 2019](https://github.com/tc39/proposal-object-from-entries))
    - `Symbol#description` ([ECMAScript 2019](https://tc39.es/ecma262/#sec-symbol.prototype.description))
    - New `Set` methods ([stage 2 proposal](https://github.com/tc39/proposal-set-methods))
      - `Set#difference`
      - `Set#intersection`
      - `Set#isDisjointFrom`
      - `Set#isSubsetOf`
      - `Set#isSupersetOf`
      - `Set#symmetricDifference`
      - `Set#union`
    - `Promise.allSettled` ([stage 2 proposal](https://github.com/tc39/proposal-promise-allSettled))
    - Getting last item from `Array` ([stage 1 proposal](https://github.com/keithamus/proposal-array-last))
      - `Array#lastItem`
      - `Array#lastIndex`
    - `String#replaceAll` ([stage 1 proposal](https://github.com/tc39/proposal-string-replace-all))
    - `String#codePoints` ([stage 1 proposal](https://github.com/tc39/proposal-string-prototype-codepoints))
    - New collections methods ([stage 1 proposal](https://github.com/tc39/collection-methods))
      - `Map.groupBy`
      - `Map.keyBy`
      - `Map#deleteAll`
      - `Map#every`
      - `Map#filter`
      - `Map#find`
      - `Map#findKey`
      - `Map#includes`
      - `Map#keyOf`
      - `Map#mapKeys`
      - `Map#mapValues`
      - `Map#merge`
      - `Map#reduce`
      - `Map#some`
      - `Map#update`
      - `Set#addAll`
      - `Set#deleteAll`
      - `Set#every`
      - `Set#filter`
      - `Set#find`
      - `Set#join`
      - `Set#map`
      - `Set#reduce`
      - `Set#some`
      - `WeakMap#deleteAll`
      - `WeakSet#addAll`
      - `WeakSet#deleteAll`
    - `compositeKey` and `compositeSymbol` methods ([stage 1 proposal](https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey))
    - `Number.fromString` ([stage 1 proposal](https://github.com/tc39/proposal-number-fromstring))
    - `Math.seededPRNG` ([stage 1 proposal](https://github.com/tc39/proposal-seeded-random))
    - `Symbol.patternMatch` ([for stage 1 pattern matching proposal](https://github.com/tc39/proposal-pattern-matching))
    - `Symbol.dispose` ([for stage 1 `using` statement proposal](https://github.com/tc39/proposal-using-statement))
    - `Promise.any` (with `AggregateError`) ([stage 0 proposal](https://github.com/tc39/proposal-promise-any))
    - `URL` and `URLSearchParam` [from `URL` standard](https://url.spec.whatwg.org/), also [stage 0 proposal to ECMAScript](https://github.com/jasnell/proposal-url)
      - `URL`
        - `URL#href`
        - `URL#origin`
        - `URL#protocol`
        - `URL#username`
        - `URL#password`
        - `URL#host`
        - `URL#hostname`
        - `URL#port`
        - `URL#pathname`
        - `URL#search`
        - `URL#searchParams`
        - `URL#hash`
        - `URL#toString`
        - `URL#toJSON`
      - `URLSearchParams`
        - `URLSearchParams#append`
        - `URLSearchParams#delete`
        - `URLSearchParams#get`
        - `URLSearchParams#getAll`
        - `URLSearchParams#has`
        - `URLSearchParams#set`
        - `URLSearchParams#sort`
        - `URLSearchParams#toString`
        - `URLSearchParams#keys`
        - `URLSearchParams#values`
        - `URLSearchParams#entries`
        - `URLSearchParams#@@iterator`
    - `.forEach` method on iterable DOM collections ([#329](https://github.com/zloirock/core-js/issues/329))
  - Improve existing features:
    - Add triggering unhandled `Promise` rejection events (instead of only global handlers), [#205](https://github.com/zloirock/core-js/issues/205).
    - Wrap `fetch` for correct with polyfilled `Promise` and preventing problems like [#178](https://github.com/zloirock/core-js/issues/178), [#332](https://github.com/zloirock/core-js/issues/332), [#371](https://github.com/zloirock/core-js/issues/371).
    - Add support of `@@isConcatSpreadable` to `Array#concat`.
    - Add support of `@@species` to `Array#{concat, filter, map, slice, splice}`.
    - Add direct `.exec` calling to `RegExp#{@@replace, @@split, @@match, @@search}`. Also, added fixes for `RegExp#exec` method. [#411](https://github.com/zloirock/core-js/issues/411), [#434](https://github.com/zloirock/core-js/issues/434), [#453](https://github.com/zloirock/core-js/issues/453), thanks [**@nicolo-ribaudo**](https://github.com/nicolo-ribaudo).
    - Correct iterators prototypes chain, related [#261](https://github.com/zloirock/core-js/issues/261).
    - Correct Typed Arrays prototypes chain, related [#378](https://github.com/zloirock/core-js/issues/378).
    - Make the internal state of polyfilled features completely unobservable, [#146](https://github.com/zloirock/core-js/issues/146).
    - Add validation of receiver's internal class to missed non-generic methods.
    - Fix descriptors of global properties.
    - In the version without global pollution, if `Object#toString` does not support `@@toStringTag`, add to wrapped prototypes own `toString` method with `@@toStringTag` logic, see [#199](https://github.com/zloirock/core-js/issues/199).
  - Update standard features and proposals:
    - `asap` (old stage 0 proposal) replaced by `queueMicrotask` ([a part of HTML spec](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask))
    - Update [`Observable`](https://github.com/tc39/proposal-observable) (#257, #276, etc.)
    - Update `Array#flatten` -> `Array#flat` and `Array#flatMap`
    - Update `global` [stage 3 proposal](https://github.com/tc39/proposal-global) - rename `global` to `globalThis`
    - Update `String#matchAll` ([proposal-string-matchall#17](https://github.com/tc39/proposal-string-matchall/pull/17), [proposal-string-matchall#38](https://github.com/tc39/proposal-string-matchall/pull/38), [proposal-string-matchall#41](https://github.com/tc39/proposal-string-matchall/pull/41), etc.) and move to the stage 3
    - Update `.name` properties of `String#{trimStart, trimEnd , trimLeft, trimRight}`, move to the stage 3
    - Remove mongolian vowel separator (U+180E) from the list of whitespaces for methods like `String#trim` (ES6 -> ES7)
  - Mark ES2016, ES2017, ES2018, ES2019 features as stable:
    - `Array#{ flat, flatMap }`
    - `{ Array, %TypedArray% }#includes`
    - `Object.{ values, entries}`
    - `Object.getOwnPropertyDescriptors`
    - `String#{ padStart, padEnd }`
    - `String#{ trimStart, trimEnd, trimLeft, trimRight }`
    - `Promise#finally`
    - `Symbol.asyncIterator`
    - `Object#__(define|lookup)[GS]etter__`
  - Remove obsolete features:
    - `Error.isError` (withdrawn)
    - `System.global` and `global` (replaced by `globalThis`)
    - `Map#toJSON` and `Set#toJSON` (rejected)
    - `RegExp.escape` (rejected)
    - `Reflect.enumerate` (removed from the spec)
    - Unnecessary iteration methods from `CSSRuleList`, `MediaList`, `StyleSheetList`
  - **No more non-standard features**, finally removed:
    - `Dict`
    - `Object.{classof, isObject, define, make}`
    - `Function#part`
    - `Number#@@iterator`
    - `String#{escapeHTML, unescapeHTML}`
    - `delay`
  - Add `.sham` flag to features which can't be properly polyfilled and / or not recommended for usage:
    - `Symbol` constructor - we can't add new primitives. `Object.prototype` accessors too expensive.
    - `Object.{create, defineProperty, defineProperties, getOwnPropertyDescriptor, getOwnPropertyDescriptors}`, `Reflect.{defineProperty, getOwnPropertyDescriptor}` can't be properly polyfilled without descriptors support.
    - `Object.{freeze, seal, preventExtensions}`, `Reflect.preventExtensions` can't be properly polyfilled in ES3 environment.
    - `Object.getPrototypeOf` can be deceived in ES3 environment.
    - `Reflect.construct` can't be polyfilled for a correct work with `newTarget` argument on built-ins.
    - Typed Array constructors polyfill is quite correct but too expensive.
    - `URL` constructor in engines without descriptors support.
- Bug and compatibility fixes:
  - Fix deoptimisation of iterators in V8, [#377](https://github.com/zloirock/core-js/issues/377).
  - Fix import of property before constructor which should contain this property, [#262](https://github.com/zloirock/core-js/issues/262).
  - Fix some cases of IE11 `WeakMap` frozen keys fallback, [#384](https://github.com/zloirock/core-js/issues/384).
  - Fix non-enumerable integer keys issue because of Nashorn ~ JDK8 bug, [#389](https://github.com/zloirock/core-js/issues/389).
  - Fix [Safari 12.0 `Array#reverse` bug](https://bugs.webkit.org/show_bug.cgi?id=188794).
  - One more fix for microtasks in iOS related [#339](https://github.com/zloirock/core-js/issues/339).
  - Added a fallback for [Rhino bug](https://github.com/mozilla/rhino/issues/346), [#440](https://github.com/zloirock/core-js/issues/440).
  - Many other internal fixes and improvements.
- Repository:
  - Change `core-js` repository structure to monorepo with packages in `/packages/` directory.
  - Clean-up it, remove all possible duplicates, generated files, etc.
- Packages:
  - **Extract a version without global namespace pollution to a separate `core-js-pure` package (replacement for `core-js/library`).**
  - **Leave only one pair of bundles (global, with all polyfills) and move it to `core-js-bundle` package.**
  - Remove bundling logic from `core-js` package, leave it only in `core-js-builder` package.
  - Clean-up packages.
  - Because of all approaches, **reduce size of packages from ~2mb for `core-js@2` to**:
    - **~500kb for `core-js` package**
    - **~440kb for `core-js-pure` package**
  - Finally remove `bower.json`
- CommonJS API, namespaces:
  - Add availability [configuration of aggressiveness](https://github.com/zloirock/core-js/blob/master/README.md#configurable-level-of-aggressiveness).
  - Move `core-js/library` to separate `core-js-pure` package.
  - Because of removing all non-standard features, we no longer need `core-js/shim` entry point, replace it just with `core-js`.
  - Move all features from ES5, ES2015, ES2016, ES2017, ES2018 and ES2019 to one namespace for stable ES - it's available as `core-js/es`, all those features in `modules` folder has `es.` prefix.
  - Change prefix for ES proposals from `es7.` to `esnext.`, they no longer available in `core-js/es7`, use `core-js/stage/*` instead of that.
  - Rename `core-js(/library)/fn` to `core-js(-pure)/features` for improve readability.
  - Allow more granular inclusion of features from `/es/` path (for example, `core-js/es/array/from`).
  - Add `/stable/` entry points as an equal of `/features/` for stable features, without proposals.
  - Add `/proposals/` entry points for allow include all features from one proposal (for example, `core-js/proposals/reflect-metadata`).
  - Add `/es|stable|features/instance/` entry points for getting polyfill of the related method for passed instance (could be used in cases like `babel-runtime`).
  - Split typed arrays polyfills. Now you can, for example, load only required method (for example, `core-js/es/typed-array/from`).
  - Extract well-known symbols definition from `es.symbol` module for loading only required features, for example, in MS Edge.
  - Rename `web.dom` namespace to `web.dom-collections`.
  - Rename `es6.regexp.{match, replace, search, split}` -> `es.string.{match, replace, search, split}` - mainly it's fixes / adding support of well-known symbols to string methods, only in second place adding related methods to regexp prototype.
  - Relax `/modules/` directory by moving internal modules to `/internals/` directory.
  - Remove deprecated array entry points: `core-js(/library)/fn/array/{pop, push, reverse, shift, unshift}`.
  - `core` object no longer available in the global version, entry points which previously returned it now returns `globalThis` object. Also, don't set global `core` property.
  - Add some missing entry points.
- Tools, tests, code quality:
  - Added `core-js-compat` package with:
    - Data about the necessity of `core-js` modules and API for getting a list of required `core-js` modules by `browserslist` query, [#466](https://github.com/zloirock/core-js/issues/466).
    - Data which modules load by each entry point (mainly useful for tools like `@babel/preset-env`).
    - Data which modules added in minor versions (mainly useful for tools like `@babel/preset-env`).
  - `core-js-builder` package:
    - Added `targets` option with `browserslist` query.
    - Removed an option for generation bundle of a version without global namespace pollution - now it's an odd use case.
    - Removed UMD wrapper from a generated code of bundles - we don't need it for a global polyfill.
  - **Getting rid of LiveScript**, usage another language in JS standard library looks strange and impedes usage of tools like ESLint:
    - Tests are rewritten to JS.
    - Scripts are rewritten to JS.
  - Babel with minimalistic config (which should work anywhere) used on tests.
  - ESLint used on tests and tools.
  - Source code refactored for improving readability.

### [2.6.5 - 2019.02.15](https://github.com/zloirock/core-js/releases/tag/v2.6.5)
- Fixed buggy `String#padStart` and `String#padEnd` mobile Safari implementations, [#414](https://github.com/zloirock/core-js/issues/414).

### [2.6.4 - 2019.02.07](https://github.com/zloirock/core-js/releases/tag/v2.6.4)
- Added a workaround against crushing an old IE11.0.9600.16384 build, [#485](https://github.com/zloirock/core-js/issues/485).

### [2.6.3 - 2019.01.22](https://github.com/zloirock/core-js/releases/tag/v2.6.3)
- Added a workaround for `babel-minify` bug, [#479](https://github.com/zloirock/core-js/issues/479)

### [2.6.2 - 2019.01.10](https://github.com/zloirock/core-js/releases/tag/v2.6.2)
- Fixed handling of `$` in `String#replace`, [#471](https://github.com/zloirock/core-js/issues/471)

### [2.6.1 - 2018.12.18](https://github.com/zloirock/core-js/releases/tag/v2.6.1)
- Fixed an issue with minified version, [#463](https://github.com/zloirock/core-js/issues/463), [#465](https://github.com/zloirock/core-js/issues/465)

### [2.6.0 - 2018.12.05](https://github.com/zloirock/core-js/releases/tag/v2.6.0)
- Add direct `.exec` calling to `RegExp#{@@replace, @@split, @@match, @@search}`. Also, added fixes for `RegExp#exec` method. [#428](https://github.com/zloirock/core-js/issues/428), [#435](https://github.com/zloirock/core-js/issues/435), [#458](https://github.com/zloirock/core-js/issues/458), thanks [**@nicolo-ribaudo**](https://github.com/nicolo-ribaudo).

### [2.5.7 - 2018.05.26](https://github.com/zloirock/core-js/releases/tag/v2.5.7)
- Get rid of reserved variable name `final`, related [#400](https://github.com/zloirock/core-js/issues/400)

### [2.5.6 - 2018.05.07](https://github.com/zloirock/core-js/releases/tag/v2.5.6)
- Forced replace native `Promise` in V8 6.6 (Node 10 and Chrome 66) because of [a bug with resolving custom thenables](https://bugs.chromium.org/p/chromium/issues/detail?id=830565)
- Added a workaround for usage buggy native LG WebOS 2 `Promise` in microtask implementation, [#396](https://github.com/zloirock/core-js/issues/396)
- Added modern version internal debugging information about used versions

### [2.5.5 - 2018.04.08](https://github.com/zloirock/core-js/releases/tag/v2.5.5)
- Fix some edge cases of `Reflect.set`, [#392](https://github.com/zloirock/core-js/issues/392) and [#393](https://github.com/zloirock/core-js/issues/393)

### [2.5.4 - 2018.03.27](https://github.com/zloirock/core-js/releases/tag/v2.5.4)
- Fixed one case of deoptimization built-in iterators in V8, related [#377](https://github.com/zloirock/core-js/issues/377)
- Fixed some cases of iterators feature detection, [#368](https://github.com/zloirock/core-js/issues/368)
- Fixed manually entered NodeJS domains issue in `Promise`, [#367](https://github.com/zloirock/core-js/issues/367)
- Fixed `Number.{parseInt, parseFloat}` entry points
- Fixed `__(define|lookup)[GS]etter__` export in the `library` version

### [2.5.3 - 2017.12.12](https://github.com/zloirock/core-js/releases/tag/v2.5.3)
- Fixed calling `onunhandledrejectionhandler` multiple times for one `Promise` chain, [#318](https://github.com/zloirock/core-js/issues/318)
- Forced replacement of `String#{padStart, padEnd}` in Safari 10 because of [a bug](https://bugs.webkit.org/show_bug.cgi?id=161944), [#280](https://github.com/zloirock/core-js/issues/280)
- Fixed `Array#@@iterator` in a very rare version of `WebKit`, [#236](https://github.com/zloirock/core-js/issues/236) and [#237](https://github.com/zloirock/core-js/issues/237)
- One more [#345](https://github.com/zloirock/core-js/issues/345)-related fix

### [2.5.2 - 2017.12.09](https://github.com/zloirock/core-js/releases/tag/v2.5.2)
- `MutationObserver` no longer used for microtask implementation in iOS Safari because of bug with scrolling, [#339](https://github.com/zloirock/core-js/issues/339)
- Fixed `JSON.stringify(undefined, replacer)` case in the wrapper from the `Symbol` polyfill, [#345](https://github.com/zloirock/core-js/issues/345)
- `Array()` calls changed to `new Array()` for V8 optimisation

### [2.5.1 - 2017.09.01](https://github.com/zloirock/core-js/releases/tag/v2.5.1)
- Updated `Promise#finally` per [tc39/proposal-promise-finally#37](https://github.com/tc39/proposal-promise-finally/issues/37)
- Optimized usage of some internal helpers for reducing size of `shim` version
- Fixed some entry points for virtual methods

### [2.5.0 - 2017.08.05](https://github.com/zloirock/core-js/releases/tag/v2.5.0)
- Added `Promise#finally` [stage 3 proposal](https://github.com/tc39/proposal-promise-finally), [#225](https://github.com/zloirock/core-js/issues/225)
- Added `Promise.try` [stage 1 proposal](https://github.com/tc39/proposal-promise-try)
- Added `Array#flatten` and `Array#flatMap` [stage 1 proposal](https://tc39.github.io/proposal-flatMap)
- Added `.of` and `.from` methods on collection constructors [stage 1 proposal](https://github.com/tc39/proposal-setmap-offrom):
  - `Map.of`
  - `Set.of`
  - `WeakSet.of`
  - `WeakMap.of`
  - `Map.from`
  - `Set.from`
  - `WeakSet.from`
  - `WeakMap.from`
- Added `Math` extensions [stage 1 proposal](https://github.com/rwaldron/proposal-math-extensions), [#226](https://github.com/zloirock/core-js/issues/226):
  - `Math.clamp`
  - `Math.DEG_PER_RAD`
  - `Math.degrees`
  - `Math.fscale`
  - `Math.RAD_PER_DEG`
  - `Math.radians`
  - `Math.scale`
- Added `Math.signbit` [stage 1 proposal](https://github.com/tc39/proposal-Math.signbit)
- Updated `global` [stage 3 proposal](https://github.com/tc39/proposal-global) - added `global` global object, `System.global` deprecated
- Updated `Object.getOwnPropertyDescriptors` to the [final version](https://tc39.es/ecma262/2017/#sec-object.getownpropertydescriptors) - it should not create properties if descriptors are `undefined`
- Updated the list of iterable DOM collections, [#249](https://github.com/zloirock/core-js/issues/249), added:
  - `CSSStyleDeclaration#@@iterator`
  - `CSSValueList#@@iterator`
  - `ClientRectList#@@iterator`
  - `DOMRectList#@@iterator`
  - `DOMStringList#@@iterator`
  - `DataTransferItemList#@@iterator`
  - `FileList#@@iterator`
  - `HTMLAllCollection#@@iterator`
  - `HTMLCollection#@@iterator`
  - `HTMLFormElement#@@iterator`
  - `HTMLSelectElement#@@iterator`
  - `MimeTypeArray#@@iterator`
  - `NamedNodeMap#@@iterator`
  - `PaintRequestList#@@iterator`
  - `Plugin#@@iterator`
  - `PluginArray#@@iterator`
  - `SVGLengthList#@@iterator`
  - `SVGNumberList#@@iterator`
  - `SVGPathSegList#@@iterator`
  - `SVGPointList#@@iterator`
  - `SVGStringList#@@iterator`
  - `SVGTransformList#@@iterator`
  - `SourceBufferList#@@iterator`
  - `TextTrackCueList#@@iterator`
  - `TextTrackList#@@iterator`
  - `TouchList#@@iterator`
- Updated stages of proposals:
  - [`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors) to [stage 4 (ES2017)](https://tc39.es/ecma262/2017/#sec-object.getownpropertydescriptors)
  - [String padding](https://github.com/tc39/proposal-string-pad-start-end) to [stage 4 (ES2017)](https://tc39.es/ecma262/2017/#sec-string.prototype.padend)
  - [`global`](https://github.com/tc39/proposal-global) to [stage 3](https://github.com/tc39/notes/blob/main/meetings/2016-09/sept-28.md#revisit-systemglobal--global)
  - [String trimming](https://github.com/tc39/proposal-string-left-right-trim) to [stage 2](https://github.com/tc39/notes/blob/main/meetings/2016-07/jul-27.md#10iic-trimstarttrimend)
- Updated typed arrays to the modern (ES2016+) arguments validation,
[#293](https://github.com/zloirock/core-js/pull/293)
- Fixed `%TypedArray%.from` Safari bug, [#285](https://github.com/zloirock/core-js/issues/285)
- Fixed compatibility with old version of Prototype.js, [#278](https://github.com/zloirock/core-js/issues/278), [#289](https://github.com/zloirock/core-js/issues/289)
- `Function#name` no longer cache the result for correct behaviour with inherited constructors, [#296](https://github.com/zloirock/core-js/issues/296)
- Added errors on incorrect context of collection methods, [#272](https://github.com/zloirock/core-js/issues/272)
- Fixed conversion typed array constructors to string, fix [#300](https://github.com/zloirock/core-js/issues/300)
- Fixed `Set#size` with debugger ReactNative for Android, [#297](https://github.com/zloirock/core-js/issues/297)
- Fixed an issue with Electron-based debugger, [#230](https://github.com/zloirock/core-js/issues/230)
- Fixed compatibility with incomplete third-party `WeakMap` polyfills, [#252](https://github.com/zloirock/core-js/pull/252)
- Added a fallback for `Date#toJSON` in engines without native `Date#toISOString`, [#220](https://github.com/zloirock/core-js/issues/220)
- Added support for Sphere Dispatch API, [#286](https://github.com/zloirock/core-js/pull/286)
- Seriously changed the coding style and the [ESLint config](https://github.com/zloirock/core-js/blob/master/.eslintrc.js)
- Updated many dev dependencies (`webpack`, `uglify`, etc)
- Some other minor fixes and optimizations

### [2.4.1 - 2016.07.18](https://github.com/zloirock/core-js/releases/tag/v2.4.1)
- Fixed `script` tag for some parsers, [#204](https://github.com/zloirock/core-js/issues/204), [#216](https://github.com/zloirock/core-js/issues/216)
- Removed some unused variables, [#217](https://github.com/zloirock/core-js/issues/217), [#218](https://github.com/zloirock/core-js/issues/218)
- Fixed MS Edge `Reflect.construct` and `Reflect.apply` - they should not allow primitive as `argumentsList` argument

### [1.2.7 [LEGACY] - 2016.07.18](https://github.com/zloirock/core-js/releases/tag/v1.2.7)
- Some fixes for issues like [#159](https://github.com/zloirock/core-js/issues/159), [#186](https://github.com/zloirock/core-js/issues/186), [#194](https://github.com/zloirock/core-js/issues/194), [#207](https://github.com/zloirock/core-js/issues/207)

### [2.4.0 - 2016.05.08](https://github.com/zloirock/core-js/releases/tag/v2.4.0)
- Added `Observable`, [stage 1 proposal](https://github.com/zenparsing/es-observable)
- Fixed behavior `Object.{getOwnPropertySymbols, getOwnPropertyDescriptor}` and `Object#propertyIsEnumerable` on `Object.prototype`
- `Reflect.construct` and `Reflect.apply` should throw an error if `argumentsList` argument is not an object, [#194](https://github.com/zloirock/core-js/issues/194)

### [2.3.0 - 2016.04.24](https://github.com/zloirock/core-js/releases/tag/v2.3.0)
- Added `asap` for enqueuing microtasks, [stage 0 proposal](https://github.com/tc39/notes/blob/main/meetings/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask)
- Added well-known symbol `Symbol.asyncIterator` for [stage 2 async iteration proposal](https://github.com/tc39/proposal-async-iteration)
- Added well-known symbol `Symbol.observable` for [stage 1 observables proposal](https://github.com/zenparsing/es-observable)
- `String#{padStart, padEnd}` returns original string if filler is empty string, [TC39 meeting notes](https://github.com/tc39/notes/blob/main/meetings/2016-03/march-29.md#stringprototypepadstartpadend)
- `Object.values` and `Object.entries` moved to stage 4 from 3, [TC39 meeting notes](https://github.com/tc39/notes/blob/main/meetings/2016-03/march-29.md#objectvalues--objectentries)
- `System.global` moved to stage 2 from 1, [TC39 meeting notes](https://github.com/tc39/notes/blob/main/meetings/2016-03/march-29.md#systemglobal)
- `Map#toJSON` and `Set#toJSON` rejected and will be removed from the next major release, [TC39 meeting notes](https://github.com/tc39/notes/blob/main/meetings/2016-03/march-31.md#mapprototypetojsonsetprototypetojson)
- `Error.isError` withdrawn and will be removed from the next major release, [TC39 meeting notes](https://github.com/tc39/notes/blob/main/meetings/2016-03/march-29.md#erroriserror)
- Added fallback for `Function#name` on non-extensible functions and functions with broken `toString` conversion, [#193](https://github.com/zloirock/core-js/issues/193)

### [2.2.2 - 2016.04.06](https://github.com/zloirock/core-js/releases/tag/v2.2.2)
- Added conversion `-0` to `+0` to `Array#{indexOf, lastIndexOf}`, [ES2016 fix](https://github.com/tc39/ecma262/pull/316)
- Added fixes for some `Math` methods in Tor Browser
- `Array.{from, of}` no longer calls prototype setters
- Added workaround over Chrome DevTools strange behavior, [#186](https://github.com/zloirock/core-js/issues/186)

### [2.2.1 - 2016.03.19](https://github.com/zloirock/core-js/releases/tag/v2.2.1)
- Fixed `Object.getOwnPropertyNames(window)` `2.1+` versions bug, [#181](https://github.com/zloirock/core-js/issues/181)

### [2.2.0 - 2016.03.15](https://github.com/zloirock/core-js/releases/tag/v2.2.0)
- Added `String#matchAll`, [proposal](https://github.com/tc39/String.prototype.matchAll)
- Added `Object#__(define|lookup)[GS]etter__`, [annex B ES2017](https://github.com/tc39/ecma262/pull/381)
- Added `@@toPrimitive` methods to `Date` and `Symbol`
- Fixed `%TypedArray%#slice` in Edge ~ 13 (throws with `@@species` and wrapped / inherited constructor)
- Some other minor fixes

### [2.1.5 - 2016.03.12](https://github.com/zloirock/core-js/releases/tag/v2.1.5)
- Improved support NodeJS domains in `Promise#then`, [#180](https://github.com/zloirock/core-js/issues/180)
- Added fallback for `Date#toJSON` bug in Qt Script, [#173](https://github.com/zloirock/core-js/issues/173#issuecomment-193972502)

### [2.1.4 - 2016.03.08](https://github.com/zloirock/core-js/releases/tag/v2.1.4)
- Added fallback for `Symbol` polyfill in Qt Script, [#173](https://github.com/zloirock/core-js/issues/173)
- Added one more fallback for IE11 `Script Access Denied` error with iframes, [#165](https://github.com/zloirock/core-js/issues/165)

### [2.1.3 - 2016.02.29](https://github.com/zloirock/core-js/releases/tag/v2.1.3)
- Added fallback for [`es6-promise` package bug](https://github.com/stefanpenner/es6-promise/issues/169), [#176](https://github.com/zloirock/core-js/issues/176)

### [2.1.2 - 2016.02.29](https://github.com/zloirock/core-js/releases/tag/v2.1.2)
- Some minor `Promise` fixes:
  - Browsers `rejectionhandled` event better HTML spec complaint
  - Errors in unhandled rejection handlers should not cause any problems
  - Fixed typo in feature detection

### [2.1.1 - 2016.02.22](https://github.com/zloirock/core-js/releases/tag/v2.1.1)
- Some `Promise` improvements:
  - Feature detection:
    - **Added detection unhandled rejection tracking support - now it's available everywhere**, [#140](https://github.com/zloirock/core-js/issues/140)
    - Added detection `@@species` pattern support for completely correct subclassing
    - Removed usage `Object.setPrototypeOf` from feature detection and noisy console message about it in FF
  - `Promise.all` fixed for some very specific cases

### [2.1.0 - 2016.02.09](https://github.com/zloirock/core-js/releases/tag/v2.1.0)
- **API**:
  - ES5 polyfills are split and logic, used in other polyfills, moved to internal modules
    - **All entry point works in ES3 environment like IE8- without `core-js/(library/)es5`**
    - **Added all missed single entry points for ES5 polyfills**
    - Separated ES5 polyfills moved to the ES6 namespace. Why?
      - Mainly, for prevent duplication features in different namespaces - logic of most required ES5 polyfills changed in ES6+:
        - Already added changes for: `Object` statics - should accept primitives, new whitespaces lists in `String#trim`, `parse(Int|float)`, `RegExp#toString` logic, `String#split`, etc
        - Should be changed in the future: `@@species` and `ToLength` logic in `Array` methods, `Date` parsing, `Function#bind`, etc
        - Should not be changed only several features like `Array.isArray` and `Date.now`
      - Some ES5 polyfills required for modern engines
    - All old entry points should work fine, but in the next major release API can be changed
  - `Object.getOwnPropertyDescriptors` moved to the stage 3, [January TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2016-01/2016-01-28.md#objectgetownpropertydescriptors-to-stage-3-jordan-harband-low-priority-but-super-quick)
  - Added `umd` option for [custom build process](https://github.com/zloirock/core-js#custom-build-from-external-scripts), [#169](https://github.com/zloirock/core-js/issues/169)
  - Returned entry points for `Array` statics, removed in `2.0`, for compatibility with `babel` `6` and for future fixes
- **Deprecated**:
  - `Reflect.enumerate` deprecated and will be removed from the next major release, [January TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2016-01/2016-01-28.md#5xix-revisit-proxy-enumerate---revisit-decision-to-exhaust-iterator)
- **New Features**:
  - Added [`Reflect` metadata API](https://rbuckton.github.io/reflect-metadata/) as a pre-strawman feature, [#152](https://github.com/zloirock/core-js/issues/152):
    - `Reflect.defineMetadata`
    - `Reflect.deleteMetadata`
    - `Reflect.getMetadata`
    - `Reflect.getMetadataKeys`
    - `Reflect.getOwnMetadata`
    - `Reflect.getOwnMetadataKeys`
    - `Reflect.hasMetadata`
    - `Reflect.hasOwnMetadata`
    - `Reflect.metadata`
  - Implementation / fixes `Date#toJSON`
  - Fixes for `parseInt` and `Number.parseInt`
  - Fixes for `parseFloat` and `Number.parseFloat`
  - Fixes for `RegExp#toString`
  - Fixes for `Array#sort`
  - Fixes for `Number#toFixed`
  - Fixes for `Number#toPrecision`
  - Additional fixes for `String#split` (`RegExp#@@split`)
- **Improvements**:
  - Correct subclassing wrapped collections, `Number` and `RegExp` constructors with native class syntax
  - Correct support `SharedArrayBuffer` and buffers from other realms in typed arrays wrappers
  - Additional validations for `Object.{defineProperty, getOwnPropertyDescriptor}` and `Reflect.defineProperty`
- **Bug Fixes**:
  - Fixed some cases `Array#lastIndexOf` with negative second argument

### [2.0.3 - 2016.01.11](https://github.com/zloirock/core-js/releases/tag/v2.0.3)
- Added fallback for V8 ~ Chrome 49 `Promise` subclassing bug causes unhandled rejection on feature detection, [#159](https://github.com/zloirock/core-js/issues/159)
- Added fix for very specific environments with global `window === null`

### [2.0.2 - 2016.01.04](https://github.com/zloirock/core-js/releases/tag/v2.0.2)
- Temporarily removed `length` validation from `Uint8Array` constructor wrapper. Reason - [bug in `ws` module](https://github.com/websockets/ws/pull/645) (-> `socket.io`) which passes to `Buffer` constructor -> `Uint8Array` float and uses [the `V8` bug](https://code.google.com/p/v8/issues/detail?id=4552) for conversion to int (by the spec should be thrown an error). [It creates problems for many people.](https://github.com/karma-runner/karma/issues/1768) I hope, it will be returned after fixing this bug in `V8`.

### [2.0.1 - 2015.12.31](https://github.com/zloirock/core-js/releases/tag/v2.0.1)
- Forced usage `Promise.resolve` polyfill in the `library` version for correct work with wrapper
- `Object.assign` should be defined in the strict mode -> throw an error on extension non-extensible objects, [#154](https://github.com/zloirock/core-js/issues/154)

### [2.0.0 - 2015.12.24](https://github.com/zloirock/core-js/releases/tag/v2.0.0)
- Added implementations and fixes [Typed Arrays](https://github.com/zloirock/core-js#ecmascript-6-typed-arrays)-related features
  - `ArrayBuffer`, `ArrayBuffer.isView`, `ArrayBuffer#slice`
  - `DataView` with all getter / setter methods
  - `Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float32Array` and `Float64Array` constructors
  - `%TypedArray%.{for, of}`, `%TypedArray%#{copyWithin, every, fill, filter, find, findIndex, forEach, indexOf, includes, join, lastIndexOf, map, reduce, reduceRight, reverse, set, slice, some, sort, subarray, values, keys, entries, @@iterator, ...}`
- Added [`System.global`](https://github.com/zloirock/core-js#ecmascript-7-proposals), [proposal](https://github.com/tc39/proposal-global), [November TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2015-11/nov-19.md#systemglobal-jhd)
- Added [`Error.isError`](https://github.com/zloirock/core-js#ecmascript-7-proposals), [proposal](https://github.com/ljharb/proposal-is-error), [November TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2015-11/nov-19.md#jhd-erroriserror)
- Added [`Math.{iaddh, isubh, imulh, umulh}`](https://github.com/zloirock/core-js#ecmascript-7-proposals), [proposal](https://gist.github.com/BrendanEich/4294d5c212a6d2254703)
- `RegExp.escape` moved from the `es7` to the non-standard `core` namespace, [July TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2015-07/july-28.md#62-regexpescape) - too slow, but it's condition of stability, [#116](https://github.com/zloirock/core-js/issues/116)
- [`Promise`](https://github.com/zloirock/core-js#ecmascript-6-promise)
  - Some performance optimisations
  - Added basic support [`rejectionHandled` event / `onrejectionhandled` handler](https://github.com/zloirock/core-js#unhandled-rejection-tracking) to the polyfill
  - Removed usage `@@species` from `Promise.{all, race}`, [November TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2015-11/nov-18.md#conclusionresolution-2)
- Some improvements [collections polyfills](https://github.com/zloirock/core-js#ecmascript-6-collections)
  - `O(1)` and preventing possible leaks with frozen keys, [#134](https://github.com/zloirock/core-js/issues/134)
  - Correct observable state object keys
- Renamed `String#{padLeft, padRight}` -> [`String#{padStart, padEnd}`](https://github.com/zloirock/core-js#ecmascript-7-proposals), [proposal](https://github.com/tc39/proposal-string-pad-start-end), [November TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2015-11/nov-17.md#conclusionresolution-2) (they want to rename it on each meeting?O_o), [#132](https://github.com/zloirock/core-js/issues/132)
- Added [`String#{trimStart, trimEnd}` as aliases for `String#{trimLeft, trimRight}`](https://github.com/zloirock/core-js#ecmascript-7-proposals), [proposal](https://github.com/sebmarkbage/ecmascript-string-left-right-trim), [November TC39 meeting](https://github.com/tc39/notes/blob/main/meetings/2015-11/nov-17.md#conclusionresolution-2)
- Added [annex B HTML methods](https://github.com/zloirock/core-js#ecmascript-6-string) - ugly, but also [the part of the spec](https://262.ecma-international.org/6.0/#sec-string.prototype.anchor)
- Added little fix for [`Date#toString`](https://github.com/zloirock/core-js#ecmascript-6-date) - `new Date(NaN).toString()` [should be `'Invalid Date'`](https://262.ecma-international.org/6.0/#sec-todatestring)
- Added [`{keys, values, entries, @@iterator}` methods to DOM collections](https://github.com/zloirock/core-js#iterable-dom-collections) which should have [iterable interface](https://heycam.github.io/webidl/#idl-iterable) or should be [inherited from `Array`](https://heycam.github.io/webidl/#LegacyArrayClass) - `NodeList`, `DOMTokenList`, `MediaList`, `StyleSheetList`, `CSSRuleList`.
- Removed Mozilla `Array` generics - [deprecated and will be removed from FF](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Array_generic_methods), [looks like strawman is dead](https://web.archive.org/web/20160805230354/http://wiki.ecmascript.org/doku.php?id=strawman:array_statics), available [alternative shim](https://github.com/plusdude/array-generics)
- Removed `core.log` module
- CommonJS API
  - Added entry points for [virtual methods](https://github.com/zloirock/core-js#commonjs-and-prototype-methods-without-global-namespace-pollution)
  - Added entry points for [stages proposals](https://github.com/zloirock/core-js#ecmascript-7-proposals)
  - Some other minor changes
- [Custom build from external scripts](https://github.com/zloirock/core-js#custom-build-from-external-scripts) moved to the separate package for preventing problems with dependencies
- Changed `$` prefix for internal modules file names because Team Foundation Server does not support it, [#129](https://github.com/zloirock/core-js/issues/129)
- Additional fix for `SameValueZero` in V8 ~ Chromium 39-42 collections
- Additional fix for FF27 `Array` iterator
- Removed usage shortcuts for `arguments` object - old WebKit bug, [#150](https://github.com/zloirock/core-js/issues/150)
- `{Map, Set}#forEach` non-generic, [#144](https://github.com/zloirock/core-js/issues/144)
- Many other improvements

### [1.2.6 - 2015.11.09](https://github.com/zloirock/core-js/releases/tag/v1.2.6)
- Reject with `TypeError` on attempt resolve promise itself
- Correct behavior with broken `Promise` subclass constructors / methods
- Added `Promise`-based fallback for microtask
- Fixed V8 and FF `Array#{values, @@iterator}.name`
- Fixed IE7- `[1, 2].join(undefined) -> '1,2'`
- Some other fixes / improvements / optimizations

### [1.2.5 - 2015.11.02](https://github.com/zloirock/core-js/releases/tag/v1.2.5)
- Some more `Number` constructor fixes:
  - Fixed V8 ~ Node 0.8 bug: `Number('+0x1')` should be `NaN`
  - Fixed `Number(' 0b1\n')` case, should be `1`
  - Fixed `Number()` case, should be `0`

### [1.2.4 - 2015.11.01](https://github.com/zloirock/core-js/releases/tag/v1.2.4)
- Fixed `Number('0b12') -> NaN` case in the shim
- Fixed V8 ~ Chromium 40- bug - `Weak(Map|Set)#{delete, get, has}` should not throw errors [#124](https://github.com/zloirock/core-js/issues/124)
- Some other fixes and optimizations

### [1.2.3 - 2015.10.23](https://github.com/zloirock/core-js/releases/tag/v1.2.3)
- Fixed some problems related old V8 bug `Object('a').propertyIsEnumerable(0) // => false`, for example, `Object.assign({}, 'qwe')` from the last release
- Fixed `.name` property and `Function#toString` conversion some polyfilled methods
- Fixed `Math.imul` arity in Safari 8-

### [1.2.2 - 2015.10.18](https://github.com/zloirock/core-js/releases/tag/v1.2.2)
- Improved optimisations for V8
- Fixed build process from external packages, [#120](https://github.com/zloirock/core-js/pull/120)
- One more `Object.{assign, values, entries}` fix for [**very** specific case](https://github.com/ljharb/proposal-object-values-entries/issues/5)

### [1.2.1 - 2015.10.02](https://github.com/zloirock/core-js/releases/tag/v1.2.1)
- Replaced fix `JSON.stringify` + `Symbol` behavior from `.toJSON` method to wrapping `JSON.stringify` - little more correct, [compat-table/642](https://github.com/kangax/compat-table/pull/642)
- Fixed typo which broke tasks scheduler in WebWorkers in old FF, [#114](https://github.com/zloirock/core-js/pull/114)

### [1.2.0 - 2015.09.27](https://github.com/zloirock/core-js/releases/tag/v1.2.0)
- Added browser [`Promise` rejection hook](#unhandled-rejection-tracking), [#106](https://github.com/zloirock/core-js/issues/106)
- Added correct [`IsRegExp`](https://262.ecma-international.org/6.0/#sec-isregexp) logic to [`String#{includes, startsWith, endsWith}`](https://github.com/zloirock/core-js/#ecmascript-6-string) and [`RegExp` constructor](https://github.com/zloirock/core-js/#ecmascript-6-regexp), `@@match` case, [example](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/match#Disabling_the_isRegExp_check)
- Updated [`String#leftPad`](https://github.com/zloirock/core-js/#ecmascript-7-proposals) [with proposal](https://github.com/ljharb/proposal-string-pad-left-right/issues/6): string filler truncated from the right side
- Replaced V8 [`Object.assign`](https://github.com/zloirock/core-js/#ecmascript-6-object) - its properties order not only incorrect, it is non-deterministic and it causes some problems
- Fixed behavior with deleted in getters properties for `Object.{`[`assign`](https://github.com/zloirock/core-js/#ecmascript-6-object)`, `[`entries, values`](https://github.com/zloirock/core-js/#ecmascript-7-proposals)`}`, [example](http://goo.gl/iQE01c)
- Fixed [`Math.sinh`](https://github.com/zloirock/core-js/#ecmascript-6-math) with very small numbers in V8 near Chromium 38
- Some other fixes and optimizations

### [1.1.4 - 2015.09.05](https://github.com/zloirock/core-js/releases/tag/v1.1.4)
- Fixed support symbols in FF34-35 [`Object.assign`](https://github.com/zloirock/core-js/#ecmascript-6-object)
- Fixed [collections iterators](https://github.com/zloirock/core-js/#ecmascript-6-iterators) in FF25-26
- Fixed non-generic WebKit [`Array.of`](https://github.com/zloirock/core-js/#ecmascript-6-array)
- Some other fixes and optimizations

### [1.1.3 - 2015.08.29](https://github.com/zloirock/core-js/releases/tag/v1.1.3)
- Fixed support Node.js domains in [`Promise`](https://github.com/zloirock/core-js/#ecmascript-6-promise), [#103](https://github.com/zloirock/core-js/issues/103)

### [1.1.2 - 2015.08.28](https://github.com/zloirock/core-js/releases/tag/v1.1.2)
- Added `toJSON` method to [`Symbol`](https://github.com/zloirock/core-js/#ecmascript-6-symbol) polyfill and to MS Edge implementation for expected `JSON.stringify` result w/o patching this method
- Replaced [`Reflect.construct`](https://github.com/zloirock/core-js/#ecmascript-6-reflect) implementations w/o correct support third argument
- Fixed `global` detection with changed `document.domain` in \~IE8, [#100](https://github.com/zloirock/core-js/issues/100)

### [1.1.1 - 2015.08.20](https://github.com/zloirock/core-js/releases/tag/v1.1.1)
- Added more correct microtask implementation for [`Promise`](#ecmascript-6-promise)

### [1.1.0 - 2015.08.17](https://github.com/zloirock/core-js/releases/tag/v1.1.0)
- Updated [string padding](https://github.com/zloirock/core-js/#ecmascript-7-proposals) to [actual proposal](https://github.com/ljharb/proposal-string-pad-left-right) - renamed, minor internal changes:
  - `String#lpad` -> `String#padLeft`
  - `String#rpad` -> `String#padRight`
- Added [string trim functions](#ecmascript-7-proposals) - [proposal](https://github.com/sebmarkbage/ecmascript-string-left-right-trim), defacto standard - required only for IE11- and fixed for some old engines:
  - `String#trimLeft`
  - `String#trimRight`
- [`String#trim`](https://github.com/zloirock/core-js/#ecmascript-6-string) fixed for some engines by es6 spec and moved from `es5` to single `es6` module
- Split [`es6.object.statics-accept-primitives`](https://github.com/zloirock/core-js/#ecmascript-6-object)
- Caps for `freeze`-family `Object` methods moved from `es5` to `es6` namespace and joined with [es6 wrappers](https://github.com/zloirock/core-js/#ecmascript-6-object)
- `es5` [namespace](https://github.com/zloirock/core-js/#commonjs) also includes modules, moved to `es6` namespace - you can use it as before
- Increased `MessageChannel` priority in `$.task`, [#95](https://github.com/zloirock/core-js/issues/95)
- Does not get `global.Symbol` on each getting iterator, if you wanna use alternative `Symbol` shim - add it before `core-js`
- [`Reflect.construct`](https://github.com/zloirock/core-js/#ecmascript-6-reflect) optimized and fixed for some cases
- Simplified [`Reflect.enumerate`](https://github.com/zloirock/core-js/#ecmascript-6-reflect), see [this question](https://esdiscuss.org/topic/question-about-enumerate-and-property-decision-timing)
- Some corrections in [`Math.acosh`](https://github.com/zloirock/core-js/#ecmascript-6-math)
- Fixed [`Math.imul`](https://github.com/zloirock/core-js/#ecmascript-6-math) for old WebKit
- Some fixes in string / RegExp [well-known symbols](https://github.com/zloirock/core-js/#ecmascript-6-regexp) logic
- Some other fixes and optimizations

### [1.0.1 - 2015.07.31](https://github.com/zloirock/core-js/releases/tag/v1.0.1)
- Some fixes for final MS Edge, replaced broken native `Reflect.defineProperty`
- Some minor fixes and optimizations
- Changed compression `client/*.min.js` options for safe `Function#name` and `Function#length`, should be fixed [#92](https://github.com/zloirock/core-js/issues/92)

### [1.0.0 - 2015.07.22](https://github.com/zloirock/core-js/releases/tag/v1.0.0)
- Added logic for [well-known symbols](https://github.com/zloirock/core-js/#ecmascript-6-regexp):
  - `Symbol.match`
  - `Symbol.replace`
  - `Symbol.split`
  - `Symbol.search`
- Actualized and optimized work with iterables:
  - Optimized  [`Map`, `Set`, `WeakMap`, `WeakSet` constructors](https://github.com/zloirock/core-js/#ecmascript-6-collections), [`Promise.all`, `Promise.race`](https://github.com/zloirock/core-js/#ecmascript-6-promise) for default `Array Iterator`
  - Optimized  [`Array.from`](https://github.com/zloirock/core-js/#ecmascript-6-array) for default `Array Iterator`
  - Added [`core.getIteratorMethod`](https://github.com/zloirock/core-js/#ecmascript-6-iterators) helper
- Uses enumerable properties in shimmed instances - collections, iterators, etc for optimize performance
- Added support native constructors to [`Reflect.construct`](https://github.com/zloirock/core-js/#ecmascript-6-reflect) with 2 arguments
- Added support native constructors to [`Function#bind`](https://github.com/zloirock/core-js/#ecmascript-5) shim with `new`
- Removed obsolete `.clear` methods native [`Weak`-collections](https://github.com/zloirock/core-js/#ecmascript-6-collections)
- Maximum modularity, reduced minimal custom build size, separated into submodules:
  - [`es6.reflect`](https://github.com/zloirock/core-js/#ecmascript-6-reflect)
  - [`es6.regexp`](https://github.com/zloirock/core-js/#ecmascript-6-regexp)
  - [`es6.math`](https://github.com/zloirock/core-js/#ecmascript-6-math)
  - [`es6.number`](https://github.com/zloirock/core-js/#ecmascript-6-number)
  - [`es7.object.to-array`](https://github.com/zloirock/core-js/#ecmascript-7-proposals)
  - [`core.object`](https://github.com/zloirock/core-js/#object)
  - [`core.string`](https://github.com/zloirock/core-js/#escaping-strings)
  - [`core.iter-helpers`](https://github.com/zloirock/core-js/#ecmascript-6-iterators)
  - Internal modules (`$`, `$.iter`, etc)
- Many other optimizations
- Final cleaning non-standard features
  - Moved `$for` to [separate library](https://github.com/zloirock/forof). This work for syntax - `for-of` loop and comprehensions
  - Moved `Date#{format, formatUTC}` to [separate library](https://github.com/zloirock/dtf). Standard way for this - `ECMA-402`
  - Removed `Math` methods from `Number.prototype`. Slight sugar for simple `Math` methods calling
  - Removed `{Array#, Array, Dict}.turn`
  - Removed `core.global`
- Uses `ToNumber` instead of `ToLength` in [`Number Iterator`](https://github.com/zloirock/core-js/#number-iterator), `Array.from(2.5)` will be `[0, 1, 2]` instead of `[0, 1]`
- Fixed [#85](https://github.com/zloirock/core-js/issues/85) - invalid `Promise` unhandled rejection message in nested `setTimeout`
- Fixed [#86](https://github.com/zloirock/core-js/issues/86) - support FF extensions
- Fixed [#89](https://github.com/zloirock/core-js/issues/89) - behavior `Number` constructor in strange case

### [0.9.18 - 2015.06.17](https://github.com/zloirock/core-js/releases/tag/v0.9.18)
- Removed `/` from [`RegExp.escape`](https://github.com/zloirock/core-js/#ecmascript-7-proposals) escaped characters

### [0.9.17 - 2015.06.14](https://github.com/zloirock/core-js/releases/tag/v0.9.17)
- Updated [`RegExp.escape`](https://github.com/zloirock/core-js/#ecmascript-7-proposals) to the [latest proposal](https://github.com/benjamingr/RexExp.escape)
- Fixed conflict with webpack dev server + IE buggy behavior

### [0.9.16 - 2015.06.11](https://github.com/zloirock/core-js/releases/tag/v0.9.16)
- More correct order resolving thenable in [`Promise`](https://github.com/zloirock/core-js/#ecmascript-6-promise) polyfill
- Uses polyfill instead of [buggy V8 `Promise`](https://github.com/zloirock/core-js/issues/78)

### [0.9.15 - 2015.06.09](https://github.com/zloirock/core-js/releases/tag/v0.9.15)
- [Collections](https://github.com/zloirock/core-js/#ecmascript-6-collections) from `library` version return wrapped native instances
- Fixed collections prototype methods in `library` version
- Optimized [`Math.hypot`](https://github.com/zloirock/core-js/#ecmascript-6-math)

### [0.9.14 - 2015.06.04](https://github.com/zloirock/core-js/releases/tag/v0.9.14)
- Updated [`Promise.resolve` behavior](https://esdiscuss.org/topic/fixing-promise-resolve)
- Added fallback for IE11 buggy `Object.getOwnPropertyNames` + iframe
- Some other fixes

### [0.9.13 - 2015.05.25](https://github.com/zloirock/core-js/releases/tag/v0.9.13)
- Added fallback for [`Symbol` polyfill](https://github.com/zloirock/core-js/#ecmascript-6-symbol) for old Android
- Some other fixes

### [0.9.12 - 2015.05.24](https://github.com/zloirock/core-js/releases/tag/v0.9.12)
- Different instances `core-js` should use / recognize the same symbols
- Some fixes

### [0.9.11 - 2015.05.18](https://github.com/zloirock/core-js/releases/tag/v0.9.11)
- Simplified [custom build](https://github.com/zloirock/core-js/#custom-build)
  - Added custom build js api
  - Added `grunt-cli` to `devDependencies` for `npm run grunt`
- Some fixes

### [0.9.10 - 2015.05.16](https://github.com/zloirock/core-js/releases/tag/v0.9.10)
- Wrapped `Function#toString` for correct work wrapped methods / constructors with methods similar to the [`lodash` `isNative`](https://github.com/lodash/lodash/issues/1197)
- Added proto versions of methods to export object in `default` version for consistency with `library` version

### [0.9.9 - 2015.05.14](https://github.com/zloirock/core-js/releases/tag/v0.9.9)
- Wrapped `Object#propertyIsEnumerable` for [`Symbol` polyfill](https://github.com/zloirock/core-js/#ecmascript-6-symbol)
- [Added proto versions of methods to `library` for ES7 bind syntax](https://github.com/zloirock/core-js/issues/65)
- Some other fixes

### [0.9.8 - 2015.05.12](https://github.com/zloirock/core-js/releases/tag/v0.9.8)
- Fixed [`Math.hypot`](https://github.com/zloirock/core-js/#ecmascript-6-math) with negative arguments
- Added `Object#toString.toString` as fallback for [`lodash` `isNative`](https://github.com/lodash/lodash/issues/1197)

### [0.9.7 - 2015.05.07](https://github.com/zloirock/core-js/releases/tag/v0.9.7)
- Added [support DOM collections](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Streamlining_cross-browser_behavior) to IE8- `Array#slice`

### [0.9.6 - 2015.05.01](https://github.com/zloirock/core-js/releases/tag/v0.9.6)
- Added [`String#lpad`, `String#rpad`](https://github.com/zloirock/core-js/#ecmascript-7-proposals)

### [0.9.5 - 2015.04.30](https://github.com/zloirock/core-js/releases/tag/v0.9.5)
- Added cap for `Function#@@hasInstance`
- Some fixes and optimizations

### [0.9.4 - 2015.04.27](https://github.com/zloirock/core-js/releases/tag/v0.9.4)
- Fixed `RegExp` constructor

### [0.9.3 - 2015.04.26](https://github.com/zloirock/core-js/releases/tag/v0.9.3)
- Some fixes and optimizations

### [0.9.2 - 2015.04.25](https://github.com/zloirock/core-js/releases/tag/v0.9.2)
- More correct [`Promise`](https://github.com/zloirock/core-js/#ecmascript-6-promise) unhandled rejection tracking and resolving / rejection priority

### [0.9.1 - 2015.04.25](https://github.com/zloirock/core-js/releases/tag/v0.9.1)
- Fixed `__proto__`-based [`Promise`](https://github.com/zloirock/core-js/#ecmascript-6-promise) subclassing in some environments

### [0.9.0 - 2015.04.24](https://github.com/zloirock/core-js/releases/tag/v0.9.0)
- Added correct [symbols](https://github.com/zloirock/core-js/#ecmascript-6-symbol) descriptors
  - Fixed behavior `Object.{assign, create, defineProperty, defineProperties, getOwnPropertyDescriptor, getOwnPropertyDescriptors}` with symbols
  - Added [single entry points](https://github.com/zloirock/core-js/#commonjs) for `Object.{create, defineProperty, defineProperties}`
- Added [`Map#toJSON`](https://github.com/zloirock/core-js/#ecmascript-7-proposals)
- Removed non-standard methods `Object#[_]` and `Function#only` - they solves syntax problems, but now in compilers available arrows and ~~in near future will be available~~ [available](https://babeljs.io/blog/2015/05/14/function-bind/) [bind syntax](https://github.com/zenparsing/es-function-bind)
- Removed non-standard undocumented methods `Symbol.{pure, set}`
- Some fixes and internal changes

### [0.8.4 - 2015.04.18](https://github.com/zloirock/core-js/releases/tag/v0.8.4)
- Uses `webpack` instead of `browserify` for browser builds - more compression-friendly result

### [0.8.3 - 2015.04.14](https://github.com/zloirock/core-js/releases/tag/v0.8.3)
- Fixed `Array` statics with single entry points

### [0.8.2 - 2015.04.13](https://github.com/zloirock/core-js/releases/tag/v0.8.2)
- [`Math.fround`](https://github.com/zloirock/core-js/#ecmascript-6-math) now also works in IE9-
- Added [`Set#toJSON`](https://github.com/zloirock/core-js/#ecmascript-7-proposals)
- Some optimizations and fixes

### [0.8.1 - 2015.04.03](https://github.com/zloirock/core-js/releases/tag/v0.8.1)
- Fixed `Symbol.keyFor`

### [0.8.0 - 2015.04.02](https://github.com/zloirock/core-js/releases/tag/v0.8.0)
- Changed [CommonJS API](https://github.com/zloirock/core-js/#commonjs)
- Split and renamed some modules
- Added support ES3 environment (ES5 polyfill) to **all** default versions - size increases slightly (+ ~4kb w/o gzip), many issues disappear, if you don't need it - [simply include only required namespaces / features / modules](https://github.com/zloirock/core-js/#commonjs)
- Removed [abstract references](https://github.com/zenparsing/es-abstract-refs) support - proposal has been superseded =\
- [`$for.isIterable` -> `core.isIterable`, `$for.getIterator` -> `core.getIterator`](https://github.com/zloirock/core-js/#ecmascript-6-iterators), temporary available in old namespace
- Fixed iterators support in v8 `Promise.all` and `Promise.race`
- Many other fixes

### [0.7.2 - 2015.03.09](https://github.com/zloirock/core-js/releases/tag/v0.7.2)
- Some fixes

### [0.7.1 - 2015.03.07](https://github.com/zloirock/core-js/releases/tag/v0.7.1)
- Some fixes

### [0.7.0 - 2015.03.06](https://github.com/zloirock/core-js/releases/tag/v0.7.0)
- Rewritten and split into [CommonJS modules](https://github.com/zloirock/core-js/#commonjs)

### [0.6.1 - 2015.02.24](https://github.com/zloirock/core-js/releases/tag/v0.6.1)
- Fixed support [`Object.defineProperty`](https://github.com/zloirock/core-js/#ecmascript-5) with accessors on DOM elements on IE8

### [0.6.0 - 2015.02.23](https://github.com/zloirock/core-js/releases/tag/v0.6.0)
- Added support safe closing iteration - calling `iterator.return` on abort iteration, if it exists
- Added basic support [`Promise`](https://github.com/zloirock/core-js/#ecmascript-6-promise) unhandled rejection tracking in shim
- Added [`Object.getOwnPropertyDescriptors`](https://github.com/zloirock/core-js/#ecmascript-7-proposals)
- Removed `console` cap - creates too many problems
- Restructuring [namespaces](https://github.com/zloirock/core-js/#custom-build)
- Some fixes

### [0.5.4 - 2015.02.15](https://github.com/zloirock/core-js/releases/tag/v0.5.4)
- Some fixes

### [0.5.3 - 2015.02.14](https://github.com/zloirock/core-js/releases/tag/v0.5.3)
- Added [support binary and octal literals](https://github.com/zloirock/core-js/#ecmascript-6-number) to `Number` constructor
- Added [`Date#toISOString`](https://github.com/zloirock/core-js/#ecmascript-5)

### [0.5.2 - 2015.02.10](https://github.com/zloirock/core-js/releases/tag/v0.5.2)
- Some fixes

### [0.5.1 - 2015.02.09](https://github.com/zloirock/core-js/releases/tag/v0.5.1)
- Some fixes

### [0.5.0 - 2015.02.08](https://github.com/zloirock/core-js/releases/tag/v0.5.0)
- Systematization of modules
- Split [`es6` module](https://github.com/zloirock/core-js/#ecmascript-6)
- Split `console` module: `web.console` - only cap for missing methods, `core.log` - bound methods & additional features
- Added [`delay` method](https://github.com/zloirock/core-js/#delay)
- Some fixes

### [0.4.10 - 2015.01.28](https://github.com/zloirock/core-js/releases/tag/v0.4.10)
- [`Object.getOwnPropertySymbols`](https://github.com/zloirock/core-js/#ecmascript-6-symbol) polyfill returns array of wrapped keys

### [0.4.9 - 2015.01.27](https://github.com/zloirock/core-js/releases/tag/v0.4.9)
- FF20-24 fix

### [0.4.8 - 2015.01.25](https://github.com/zloirock/core-js/releases/tag/v0.4.8)
- Some [collections](https://github.com/zloirock/core-js/#ecmascript-6-collections) fixes

### [0.4.7 - 2015.01.25](https://github.com/zloirock/core-js/releases/tag/v0.4.7)
- Added support frozen objects as [collections](https://github.com/zloirock/core-js/#ecmascript-6-collections) keys

### [0.4.6 - 2015.01.21](https://github.com/zloirock/core-js/releases/tag/v0.4.6)
- Added [`Object.getOwnPropertySymbols`](https://github.com/zloirock/core-js/#ecmascript-6-symbol)
- Added [`NodeList.prototype[@@iterator]`](https://github.com/zloirock/core-js/#ecmascript-6-iterators)
- Added basic `@@species` logic - getter in native constructors
- Removed `Function#by`
- Some fixes

### [0.4.5 - 2015.01.16](https://github.com/zloirock/core-js/releases/tag/v0.4.5)
- Some fixes

### [0.4.4 - 2015.01.11](https://github.com/zloirock/core-js/releases/tag/v0.4.4)
- Enabled CSP support

### [0.4.3 - 2015.01.10](https://github.com/zloirock/core-js/releases/tag/v0.4.3)
- Added `Function` instances `name` property for IE9+

### [0.4.2 - 2015.01.10](https://github.com/zloirock/core-js/releases/tag/v0.4.2)
- `Object` static methods accept primitives
- `RegExp` constructor can alter flags (IE9+)
- Added `Array.prototype[Symbol.unscopables]`

### [0.4.1 - 2015.01.05](https://github.com/zloirock/core-js/releases/tag/v0.4.1)
- Some fixes

### [0.4.0 - 2015.01.03](https://github.com/zloirock/core-js/releases/tag/v0.4.0)
- Added [`es6.reflect`](https://github.com/zloirock/core-js/#ecmascript-6-reflect) module:
  - Added `Reflect.apply`
  - Added `Reflect.construct`
  - Added `Reflect.defineProperty`
  - Added `Reflect.deleteProperty`
  - Added `Reflect.enumerate`
  - Added `Reflect.get`
  - Added `Reflect.getOwnPropertyDescriptor`
  - Added `Reflect.getPrototypeOf`
  - Added `Reflect.has`
  - Added `Reflect.isExtensible`
  - Added `Reflect.preventExtensions`
  - Added `Reflect.set`
  - Added `Reflect.setPrototypeOf`
- `core-js` methods now can use external `Symbol.iterator` polyfill
- Some fixes

### [0.3.3 - 2014.12.28](https://github.com/zloirock/core-js/releases/tag/v0.3.3)
- [Console cap](https://github.com/zloirock/core-js/#console) excluded from node.js default builds

### [0.3.2 - 2014.12.25](https://github.com/zloirock/core-js/releases/tag/v0.3.2)
- Added cap for [ES5](https://github.com/zloirock/core-js/#ecmascript-5) freeze-family methods
- Fixed `console` bug

### [0.3.1 - 2014.12.23](https://github.com/zloirock/core-js/releases/tag/v0.3.1)
- Some fixes

### [0.3.0 - 2014.12.23](https://github.com/zloirock/core-js/releases/tag/v0.3.0)
- Optimize [`Map` & `Set`](https://github.com/zloirock/core-js/#ecmascript-6-collections):
  - Use entries chain on hash table
  - Fast & correct iteration
  - Iterators moved to [`es6`](https://github.com/zloirock/core-js/#ecmascript-6) and [`es6.collections`](https://github.com/zloirock/core-js/#ecmascript-6-collections) modules

### [0.2.5 - 2014.12.20](https://github.com/zloirock/core-js/releases/tag/v0.2.5)
- `console` no longer shortcut for `console.log` (compatibility problems)
- Some fixes

### [0.2.4 - 2014.12.17](https://github.com/zloirock/core-js/releases/tag/v0.2.4)
- Better compliance of ES6
- Added [`Math.fround`](https://github.com/zloirock/core-js/#ecmascript-6-math) (IE10+)
- Some fixes

### [0.2.3 - 2014.12.15](https://github.com/zloirock/core-js/releases/tag/v0.2.3)
- [Symbols](https://github.com/zloirock/core-js/#ecmascript-6-symbol):
  - Added option to disable addition setter to `Object.prototype` for Symbol polyfill:
    - Added `Symbol.useSimple`
    - Added `Symbol.useSetter`
  - Added cap for well-known Symbols:
    - Added `Symbol.hasInstance`
    - Added `Symbol.isConcatSpreadable`
    - Added `Symbol.match`
    - Added `Symbol.replace`
    - Added `Symbol.search`
    - Added `Symbol.species`
    - Added `Symbol.split`
    - Added `Symbol.toPrimitive`
    - Added `Symbol.unscopables`

### [0.2.2 - 2014.12.13](https://github.com/zloirock/core-js/releases/tag/v0.2.2)
- Added [`RegExp#flags`](https://github.com/zloirock/core-js/#ecmascript-6-regexp) ([December 2014 Draft Rev 29](https://web.archive.org/web/20170119181824/http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts))
- Added [`String.raw`](https://github.com/zloirock/core-js/#ecmascript-6-string)

### [0.2.1 - 2014.12.12](https://github.com/zloirock/core-js/releases/tag/v0.2.1)
- Repair converting -0 to +0 in [native collections](https://github.com/zloirock/core-js/#ecmascript-6-collections)

### [0.2.0 - 2014.12.06](https://github.com/zloirock/core-js/releases/tag/v0.2.0)
- Added [`es7.proposals`](https://github.com/zloirock/core-js/#ecmascript-7-proposals) and [`es7.abstract-refs`](https://github.com/zenparsing/es-abstract-refs) modules
- Added [`String#at`](https://github.com/zloirock/core-js/#ecmascript-7-proposals)
- Added real [`String Iterator`](https://github.com/zloirock/core-js/#ecmascript-6-iterators), older versions used Array Iterator
- Added abstract references support:
  - Added `Symbol.referenceGet`
  - Added `Symbol.referenceSet`
  - Added `Symbol.referenceDelete`
  - Added `Function#@@referenceGet`
  - Added `Map#@@referenceGet`
  - Added `Map#@@referenceSet`
  - Added `Map#@@referenceDelete`
  - Added `WeakMap#@@referenceGet`
  - Added `WeakMap#@@referenceSet`
  - Added `WeakMap#@@referenceDelete`
  - Added `Dict.{...methods}[@@referenceGet]`
- Removed deprecated `.contains` methods
- Some fixes

### [0.1.5 - 2014.12.01](https://github.com/zloirock/core-js/releases/tag/v0.1.5)
- Added [`Array#copyWithin`](https://github.com/zloirock/core-js/#ecmascript-6-array)
- Added [`String#codePointAt`](https://github.com/zloirock/core-js/#ecmascript-6-string)
- Added [`String.fromCodePoint`](https://github.com/zloirock/core-js/#ecmascript-6-string)

### [0.1.4 - 2014.11.27](https://github.com/zloirock/core-js/releases/tag/v0.1.4)
- Added [`Dict.mapPairs`](https://github.com/zloirock/core-js/#dict)

### [0.1.3 - 2014.11.20](https://github.com/zloirock/core-js/releases/tag/v0.1.3)
- [TC39 November meeting](https://github.com/tc39/notes/blob/main/meetings/2014-11):
  - [`.contains` -> `.includes`](https://github.com/tc39/notes/blob/main/meetings/2014-11/nov-18.md#51--44-arrayprototypecontains-and-stringprototypecontains)
    - `String#contains` -> [`String#includes`](https://github.com/zloirock/core-js/#ecmascript-6-string)
    - `Array#contains` -> [`Array#includes`](https://github.com/zloirock/core-js/#ecmascript-7-proposals)
    - `Dict.contains` -> [`Dict.includes`](https://github.com/zloirock/core-js/#dict)
  - [Removed `WeakMap#clear`](https://github.com/tc39/notes/blob/main/meetings/2014-11/nov-19.md#412-should-weakmapweakset-have-a-clear-method-markm)
  - [Removed `WeakSet#clear`](https://github.com/tc39/notes/blob/main/meetings/2014-11/nov-19.md#412-should-weakmapweakset-have-a-clear-method-markm)

### [0.1.2 - 2014.11.19](https://github.com/zloirock/core-js/releases/tag/v0.1.2)
- `Map` & `Set` bug fix

### [0.1.1 - 2014.11.18](https://github.com/zloirock/core-js/releases/tag/v0.1.1)
- Public release
