import _Promise from "@core-js/pure/actual/promise/constructor";
// `(0, Promise)?.foo` puts a polyfillable identifier as the SE tail of a fallback receiver.
// The leaf must be marked skipped so the inner `Promise -> _Promise` rewrite doesn't double-apply.
const probe = _Promise?.foo;
probe;