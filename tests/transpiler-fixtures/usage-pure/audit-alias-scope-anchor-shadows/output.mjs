import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Alias resolution uses the declaration's scope, not a shadowing call site's scope.
// Pattern bindings denote their selected slot; literal-wrapper reads stay native while later supported calls resolve.

const factory = () => Array;
export function callSiteShadow(Array) {
  return _Array$from([1, 2]);
}

// NEGATIVE: a pattern-bound name is a SLOT of its init - following the container inlined `g`
// as the callee and substituted a static where native throws (`f` is undefined)
const maker = () => Array;
const {
  f
} = maker;
export function keepsNativeThrow() {
  return f().from([3]);
}

// A const-bound array wrapper reached through a pattern still supplies its actual element value.
const [wrapper] = [[_globalThis]];
export const [{
  Array: {
    from: viaWrapper
  }
}] = wrapper;
export const wrapperResolved = viaWrapper([5]);

// a require-bound global-proxy root collapses like the literal spelling
var g = require("@core-js/pure/es/global-this");
export const requireBoundRoot = null == g.window ? void 0 : _Array$from([6]);