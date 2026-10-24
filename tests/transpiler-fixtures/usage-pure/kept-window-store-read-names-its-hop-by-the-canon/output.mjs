import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a store holding the environment probe is the base of the run over it whatever spells the hop it
// stores - a literal, a template, a key bound to a constant name read alike by the realm-hop canon -
// so a read through it keeps the store and drops the realm hops above it, the throw included. a
// store whose own run lands on a backed hop holds that ponyfill, and the read rides it
let n;
const key = 'window';
export const literalKey = (n = _globalThis['window']).literalSlot;
export const templateKey = (n = _globalThis[`window`]).templateSlot;
export const boundKey = (n = _globalThis[key]).boundSlot;
export const deeperRun = (n = _globalThis['window']).deeperSlot;
export const backedStore = (n = _self).backedSlot;
export { n };