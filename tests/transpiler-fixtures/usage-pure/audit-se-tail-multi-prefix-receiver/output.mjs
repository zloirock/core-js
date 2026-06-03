import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// SE-tail receiver with MULTIPLE leading expressions under an OPTIONAL CALL:
// `(a(), b(), globalThis).flat?.(0)`. the `.flat` access is non-optional, so the full SE
// prefix (`a(), b()`) lifts in source order ahead of the polyfilled receiver - the optional
// call's `?.` must NOT flip it to a receiver memoize (both plugins emit the same peeled order)
declare const a: () => void;
declare const b: () => void;
a(), b(), _flatMaybeArray(_globalThis)?.call(_globalThis, 0);