// Float16Array.from polyfills via the generic typed-array/from entry. the
// constructor is engine-only in core-js v4 (no es.typed-array.float16-array
// module), so this fixture verifies that the static method gets the
// es.typed-array.from polyfill cascade WITHOUT pulling in any constructor
// module.
Float16Array.from(arr);
