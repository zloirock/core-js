# unit-global

QUnit unit tests for the global flavor: one file per polyfill module, named after it, asserting the behavior the specification requires of the installed built-in. A few dozen files carry a module name that no longer exists - the ES5-era built-ins the baseline assumes rather than polyfills - and they stay to pin the behavior the library relies on. These conventions also govern `tests/unit-pure/`, which documents only what differs.

## Target environment

Modern syntax, transpiled to ES5 by Babel before running - the same file is executed in Node, in browsers through Karma and Playwright, and in Bun, so nothing here may depend on one of them. `tests/helpers/` is shared with the pure tests and is therefore held to their restrictions, which is why a helper cannot reach for a modern built-in.

Run with `npm run test-unit-node`, `npm run test-unit-karma` or `npm run test-unit-bun`; each builds the bundles it needs. The karma legs additionally load the pre-built `core-js-bundle`, so after changing runtime code run `npm run bundle` rather than the suite alone.

## Conventions

- The file name is the module name. It has to start with `es.`, `esnext.`, `web.` or `helpers.`, because the generated index only imports files matching that shape - a test named anything else is silently never run
- `index.js` is generated from the directory listing and gitignored
- A test for a method opens by pinning its shape - that it is a function, its arity, its name, that it looks native, and that it is non-enumerable - and only then asserts behavior. What is not a method pins whatever shape it has instead: that a constructor is an object, that a well-known symbol sits on the prototype non-enumerably
- Assertions come from `tests/helpers/qunit-helpers.js`: `arity`, `name`, `looksNative`, `nonEnumerable`, `nonConfigurable`, `nonWritable`, `isFunction`, `isIterable`, `isIterator`, `arrayEqual`, `closeTo`, `same`, `notSame`, `avoid`, `required` and the rest. Use them instead of hand-rolled equivalents - they carry the descriptor and engine caveats
- Test fixtures come from `tests/helpers/helpers.js`, imported by most of the suite: the builders for the awkward inputs a specification demands - `createIterable`, `createAsyncIterable`, `createIterator`, `createSetLike`, `nullProto`, `createConversionChecker`, `nativeSubclass`, `patchRegExp$exec` and the rest. Hand-rolling one of these usually means testing your own mock instead of the polyfill
- Environment differences that several tests share live in `tests/helpers/constants.js` - the engine flags, the typed-array lists, the descriptor and function-name capabilities. Probing inline is for what only one test needs, such as whether this engine has `SharedArrayBuffer` at all
- Assert what the specification requires, not what the current implementation happens to return
- A polyfill only runs where the engine lacks a usable native, so on current engines most of these tests exercise the native. `URL` is the extreme case: nothing in a normal run executes its polyfill body, and assertions there prove nothing about it
