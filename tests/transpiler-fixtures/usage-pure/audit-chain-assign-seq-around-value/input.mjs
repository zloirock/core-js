// A sequence around a kept assignment preserves the store and its preceding effect once.
// The following constructor or static read still selects its pure binding, and any polyfill
// inside the sequence remains rewritten. A name read needs no second receiver evaluation.
const arr = [1];
let t;
export const seqAroundGuard = ((arr.at(0), t = globalThis.self))?.Map.name;
export const seqAroundStatic = ((arr.at(0), t = globalThis.self)).Number.MAX_SAFE_INTEGER;
export const seqAroundTail = ((arr.at(0), t = globalThis.self.window)).Map.name;
// A live optional tail probes and stores the terminal window value instead of a collapsed realm.
export const seqAroundGuardTail = ((arr.at(0), t = globalThis.self.window))?.Map.name;
// Both wrapped and bare optional constructor reads preserve the same terminal stored value
// and keep the source guard when that value can be undefined.
export const seqAroundGuardCtor = ((arr.at(0), t = globalThis.self.window))?.Map;
export const bareGuardCtor = (t = globalThis.self.window)?.Map;

// An alias root follows the same navigation rules. A for-of receiver also preserves the
// sequence effect and store before invoking the selected static.
const galias = globalThis;
export const aliasSeqAround = ((arr.at(0), t = galias.self)).Number.MAX_SAFE_INTEGER;
export const forInit = (() => { const out = []; for (const x of ((arr.at(0), t = globalThis.self)).Array.of(7)) out.push(x); return out; })();
