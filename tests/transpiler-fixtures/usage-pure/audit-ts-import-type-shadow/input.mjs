// type-only imports (3 forms) are elided by tsc; references resolve to the global.
// each form produces a real binding in the scope tracker, but none of them shadow a
// runtime polyfill - the polyfill must fire for the global usage
import type Map from "x";
import type { WeakMap } from "y";
import { type Set } from "z";
// @ts-expect-error a type-only import read as a value is the shape under test
export const a = new Map();
// @ts-expect-error a type-only import read as a value is the shape under test
export const b = new WeakMap();
// @ts-expect-error a type-only import read as a value is the shape under test
export const c = new Set();
