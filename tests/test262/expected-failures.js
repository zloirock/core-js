'use strict';
// Paths are relative to test262/test. Keep individual tests here, not whole namespaces.
module.exports = [
  // ES3-compatible functions remain constructible (including the polyfills used on Node 22).
  'built-ins/Error/isError/is-a-constructor.js',
  'built-ins/Iterator/concat/non-constructible.js',
  'built-ins/Iterator/prototype/chunks/non-constructible.js',
  'built-ins/Iterator/prototype/drop/non-constructible.js',
  'built-ins/Iterator/prototype/filter/non-constructible.js',
  'built-ins/Iterator/prototype/flatMap/non-constructible.js',
  'built-ins/Iterator/prototype/map/non-constructible.js',
  'built-ins/Iterator/prototype/take/non-constructible.js',
  'built-ins/Iterator/prototype/windows/non-constructible.js',
  'built-ins/Iterator/zip/non-constructible.js',
  'built-ins/Iterator/zipKeyed/non-constructible.js',
  'built-ins/Promise/allKeyed/resolve-element-function-properties.js',
  'built-ins/Promise/allSettledKeyed/element-function-properties.js',
  'built-ins/Uint8Array/fromBase64/nonconstructor.js',
  'built-ins/Uint8Array/fromHex/nonconstructor.js',
  'built-ins/Uint8Array/prototype/setFromBase64/nonconstructor.js',
  'built-ins/Uint8Array/prototype/setFromHex/nonconstructor.js',
  'built-ins/Uint8Array/prototype/toBase64/nonconstructor.js',
  'built-ins/Uint8Array/prototype/toHex/nonconstructor.js',

  // Iterator fallbacks consult legacy iterator keys and Symbol.toStringTag.
  'built-ins/Iterator/zip/iterables-iteration.js',
  'built-ins/Iterator/zipKeyed/iterables-iteration.js',

  // Error.isError is a sham: its class tag fallback cannot distinguish spoofed Error objects.
  'built-ins/Error/isError/fake-errors.js',

  // Polyfilled helpers use their own prototypes instead of a shared %IteratorHelperPrototype%.
  'built-ins/Iterator/zip/result-is-iterator.js',
  'built-ins/Iterator/zipKeyed/result-is-iterator.js',

  // Polyfilled constructors on Node 22 do not support these exotic newTarget prototypes.
  'built-ins/AsyncDisposableStack/newtarget-prototype-is-not-object.js',
  'built-ins/AsyncDisposableStack/prototype-from-newtarget-custom.js',
  'built-ins/DisposableStack/newtarget-prototype-is-not-object.js',
  'built-ins/DisposableStack/prototype-from-newtarget-custom.js',
  'built-ins/SuppressedError/newtarget-proto-custom.js',

  // Other realms do not receive the prelude or expose their missing intrinsic prototypes.
  'built-ins/AsyncDisposableStack/proto-from-ctor-realm.js',
  'built-ins/DisposableStack/proto-from-ctor-realm.js',
  'built-ins/Error/isError/errors-other-realm.js',
  'built-ins/RegExp/escape/cross-realm.js',
  'built-ins/SuppressedError/proto-from-ctor-realm.js',
  'built-ins/Symbol/asyncDispose/cross-realm.js',
  'built-ins/Symbol/dispose/cross-realm.js',

  // Missing well-known symbols are shared through Symbol.for by the polyfill.
  'built-ins/Symbol/asyncDispose/no-key.js',
  'built-ins/Symbol/dispose/no-key.js',

  // The test's hoisted Array declaration replaces the builtin before the prelude initializes.
  'built-ins/Object/keys/15.2.3.14-2-3.js',

  // The test's global self binding conflicts with web.self inside the Node VM context.
  'built-ins/Promise/race/resolve-self.js',

  // Native V8 concat skips the poisoned index of an array-like with MAX_SAFE_INTEGER length.
  'built-ins/Array/prototype/concat/arg-length-near-integer-limit.js',

  // Native V8 setFromBase64 rejects trailing garbage even when the target is already full.
  'built-ins/Uint8Array/prototype/setFromBase64/trailing-garbage.js',

  // The Set methods proposal adds join, which Array.prototype.toString calls on a Set.
  'built-ins/Array/prototype/toString/non-callable-join-string-tag.js',

  // Native V8 exposes distinct restricted-function accessors instead of one %ThrowTypeError%.
  'built-ins/Function/prototype/arguments/prop-desc.js',
  'built-ins/Function/prototype/caller/prop-desc.js',
  'built-ins/Function/prototype/caller-arguments/accessor-properties.js',

  // Native Node 22 RegExp methods still read global/unicode instead of flags.
  'built-ins/RegExp/prototype/Symbol.match/flags-tostring-error.js',
  'built-ins/RegExp/prototype/Symbol.match/get-flags-err.js',
  'built-ins/RegExp/prototype/Symbol.match/get-unicode-error.js',
  'built-ins/RegExp/prototype/Symbol.replace/flags-tostring-error.js',
  'built-ins/RegExp/prototype/Symbol.replace/get-flags-err.js',
  'built-ins/RegExp/prototype/Symbol.replace/get-unicode-error.js',

  // Native Node 22 omits the matched string from replacer arguments for an empty exec result.
  'built-ins/RegExp/prototype/Symbol.replace/fn-invoke-args-empty-result.js',

  // Native Node 22 String methods still look up symbol hooks on primitive arguments.
  'built-ins/String/prototype/match/cstm-matcher-on-bigint-primitive.js',
  'built-ins/String/prototype/match/cstm-matcher-on-boolean-primitive.js',
  'built-ins/String/prototype/match/cstm-matcher-on-number-primitive.js',
  'built-ins/String/prototype/match/cstm-matcher-on-string-primitive.js',
  'built-ins/String/prototype/matchAll/cstm-matchall-on-bigint-primitive.js',
  'built-ins/String/prototype/matchAll/cstm-matchall-on-number-primitive.js',
  'built-ins/String/prototype/matchAll/cstm-matchall-on-string-primitive.js',
  'built-ins/String/prototype/replace/cstm-replace-on-bigint-primitive.js',
  'built-ins/String/prototype/replace/cstm-replace-on-boolean-primitive.js',
  'built-ins/String/prototype/replace/cstm-replace-on-number-primitive.js',
  'built-ins/String/prototype/replace/cstm-replace-on-string-primitive.js',
  'built-ins/String/prototype/replaceAll/cstm-replaceall-on-bigint-primitive.js',
  'built-ins/String/prototype/replaceAll/cstm-replaceall-on-boolean-primitive.js',
  'built-ins/String/prototype/replaceAll/cstm-replaceall-on-number-primitive.js',
  'built-ins/String/prototype/replaceAll/cstm-replaceall-on-string-primitive.js',
  'built-ins/String/prototype/search/cstm-search-on-bigint-primitive.js',
  'built-ins/String/prototype/search/cstm-search-on-boolean-primitive.js',
  'built-ins/String/prototype/search/cstm-search-on-number-primitive.js',
  'built-ins/String/prototype/search/cstm-search-on-string-primitive.js',
  'built-ins/String/prototype/split/cstm-split-on-bigint-primitive.js',
  'built-ins/String/prototype/split/cstm-split-on-boolean-primitive.js',
  'built-ins/String/prototype/split/cstm-split-on-number-primitive.js',
  'built-ins/String/prototype/split/cstm-split-on-string-primitive.js',

  // The full v3 bundle retains the old Set methods proposal for backward compatibility.
  // Its iterable adapter accepts arrays/strings and reads size before GetSetRecord does.
  'built-ins/Set/prototype/difference/array-throws.js',
  'built-ins/Set/prototype/difference/called-with-object.js',
  'built-ins/Set/prototype/difference/set-like-class-order.js',
  'built-ins/Set/prototype/intersection/array-throws.js',
  'built-ins/Set/prototype/intersection/called-with-object.js',
  'built-ins/Set/prototype/intersection/set-like-class-order.js',
  'built-ins/Set/prototype/isDisjointFrom/array-throws.js',
  'built-ins/Set/prototype/isDisjointFrom/called-with-object.js',
  'built-ins/Set/prototype/isDisjointFrom/set-like-class-order.js',
  'built-ins/Set/prototype/isSubsetOf/array-throws.js',
  'built-ins/Set/prototype/isSubsetOf/called-with-object.js',
  'built-ins/Set/prototype/isSubsetOf/set-like-class-order.js',
  'built-ins/Set/prototype/isSupersetOf/array-throws.js',
  'built-ins/Set/prototype/isSupersetOf/called-with-object.js',
  'built-ins/Set/prototype/isSupersetOf/set-like-class-order.js',
  'built-ins/Set/prototype/symmetricDifference/array-throws.js',
  'built-ins/Set/prototype/symmetricDifference/called-with-object.js',
  'built-ins/Set/prototype/symmetricDifference/set-like-class-order.js',
  'built-ins/Set/prototype/union/array-throws.js',
  'built-ins/Set/prototype/union/called-with-object.js',
  'built-ins/Set/prototype/union/set-like-class-order.js',
];
