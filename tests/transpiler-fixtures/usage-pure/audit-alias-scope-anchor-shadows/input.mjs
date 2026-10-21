// Shared capture and receiver-default routes preserve independently supported claims.
// Binding identity, writes and later reads retain their existing inference and ordering.

const factory = () => Array;
export function callSiteShadow(Array) {
  return factory().from([1, 2]);
}

const maker = () => Array;
const { f } = maker;
export function keepsNativeThrow() {
  return f().from([3]);
}

const [wrapper] = [[globalThis]];
export const [{ Array: { from: viaWrapper } }] = wrapper;
export const wrapperResolved = viaWrapper([5]);

var g = require("@core-js/pure/es/global-this");
export const requireBoundRoot = g.window?.self.Array.from([6]);
