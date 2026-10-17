import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// a store holding the environment probe is the base of the run over it whatever spells the hop it
// stores - a literal, a template, a key bound to a constant name read alike by the realm-hop canon -
// so a read through it keeps the store and drops the realm hops above it, the throw included. a
// store whose own run lands on a backed hop holds that ponyfill, and the read rides it
let n;
const key = 'window';
export const literalKey = (n = globalThis['window']).self.literalSlot;
export const templateKey = (n = globalThis[`window`]).self.templateSlot;
export const boundKey = (n = globalThis[key]).self.boundSlot;
export const deeperRun = (n = globalThis['window']).self.self.deeperSlot;
export const backedStore = (n = globalThis.window.self).self.backedSlot;
export { n };