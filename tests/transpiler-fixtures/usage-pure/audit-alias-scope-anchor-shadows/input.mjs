// the pure twins of the scope-anchor rows: a value resolved through an alias walk re-anchors in
// the alias's own declaration scope, and a pattern-bound name holds a SLOT, never its container

// an inline-callee's returned body resolves in the callee's scope - the shadowed call site still
// substitutes the module-level Array's static
const factory = () => Array;
export function callSiteShadow(Array) {
  return factory().from([1, 2]);
}

// NEGATIVE: a pattern-bound name is a SLOT of its init - following the container inlined `g`
// as the callee and substituted a static where native throws (`f` is undefined)
const maker = () => Array;
const { f } = maker;
export function keepsNativeThrow() {
  return f().from([3]);
}

// a const-bound array wrapper reached through a PATTERN slot still descends to its real value
const [wrapper] = [[globalThis]];
export const [{ Array: { from: viaWrapper } }] = wrapper;
export const wrapperResolved = viaWrapper([5]);

// a require-bound global-proxy root collapses like the literal spelling
var g = require("@core-js/pure/es/global-this");
export const requireBoundRoot = g.window?.self.Array.from([6]);
