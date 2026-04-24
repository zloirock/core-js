// Float16Array constructor reference triggers the typed-array/methods cascade -
// even though core-js v4 ships no es.typed-array.float16-array constructor module
// (engine-only), all es.typed-array.* prototype method polyfills are still injected.
new Float16Array(arr);
