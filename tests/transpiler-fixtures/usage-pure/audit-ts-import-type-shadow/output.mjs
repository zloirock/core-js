import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// type-only imports (3 forms) are elided by tsc; references resolve to the global.
// each form produces a real binding in the scope tracker, but none of them shadow a
// runtime polyfill - the polyfill must fire for the global usage
import type Map from "x";
import type { WeakMap } from "y";
import { type Set } from "z";
// TS7 leaves the unresolved default import opaque in value position.
export const a = new _Map();
// @ts-expect-error a type-only import read as a value is the shape under test
export const b = new _WeakMap();
// @ts-expect-error a type-only import read as a value is the shape under test
export const c = new _Set();