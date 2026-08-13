// a sequence AROUND the kept assignment (`((se(), t = nav)).Map`) - not inside its value - must
// not hide the chain-assign from the claim machinery: the claim still fires through the kept
// assignment, the value spells by the shared canon (leaf ponyfill / collapsed tail), and the
// prefix effect keeps its own polyfill and runs exactly once, ahead of the assignment. the
// emitters differ only in the memo shape around the claim (an AST memoize vs a direct argument)
const arr = [1];
let t;
export const seqAroundGuard = ((arr.at(0), t = globalThis.self))?.Map.name;
export const seqAroundStatic = ((arr.at(0), t = globalThis.self)).Number.MAX_SAFE_INTEGER;
export const seqAroundTail = ((arr.at(0), t = globalThis.self.window)).Map.name;
// the same tail value under a LIVE guard: the test spells the collapsed value, never a raw hop
export const seqAroundGuardTail = ((arr.at(0), t = globalThis.self.window))?.Map.name;
// a chain-END ctor read under the guard: the erase verdict must not flip on the wrapper - the
// wrapped twin holds the same undefinable value as the bare spelling, so both keep the guard
export const seqAroundGuardCtor = ((arr.at(0), t = globalThis.self.window))?.Map;
export const bareGuardCtor = (t = globalThis.self.window)?.Map;

// an ALIAS root digs the same way (its binding rewrites itself, the value canon keeps the
// alias name), and a for-init receiver crosses the discard channel that keeps effect-free
// receiver tails alive
const galias = globalThis;
export const aliasSeqAround = ((arr.at(0), t = galias.self)).Number.MAX_SAFE_INTEGER;
export const forInit = (() => { const out = []; for (const x of ((arr.at(0), t = globalThis.self)).Array.of(7)) out.push(x); return out; })();
